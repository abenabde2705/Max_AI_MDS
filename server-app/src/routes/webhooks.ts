import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import { sendSubscriptionEmail, sendPaymentFailedEmail, sendSubscriptionCancelledEmail, sendDisputeOpenedEmail, sendDisputeResolvedEmail } from '../services/email.js';
import { sequelize } from '../config/db.js';

const router = Router();

let _stripe: Stripe | null = null;
const getStripe = (): Stripe => {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) { throw new Error('STRIPE_SECRET_KEY non configuré'); }
    _stripe = new Stripe(key, { apiVersion: '2026-02-25.clover' });
  }
  return _stripe;
};

/**
 * POST /api/webhooks/stripe
 * Reçoit les événements Stripe — doit être monté avec express.raw() AVANT express.json()
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    res.status(400).json({ message: 'Signature ou secret webhook manquant' });
    return;
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Erreur de vérification webhook Stripe:', message);
    res.status(400).json({ message: `Webhook Error: ${message}` });
    return;
  }

  // Déduplication — ignorer les events déjà traités
  try {
    await sequelize.query(
      'INSERT INTO stripe_webhook_events (event_id, processed_at) VALUES (:eventId, NOW())',
      { replacements: { eventId: event.id } }
    );
  } catch {
    // Violation de clé primaire = event déjà traité
    console.log(`Webhook Stripe dupliqué ignoré: ${event.id}`);
    res.json({ received: true });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        await handleDisputeCreated(dispute);
        break;
      }

      case 'charge.dispute.closed': {
        const dispute = event.data.object as Stripe.Dispute;
        await handleDisputeClosed(dispute);
        break;
      }

      default:
        console.log(`Événement Stripe non géré: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: unknown) {
    console.error('Erreur lors du traitement du webhook:', error);
    res.status(500).json({ message: 'Erreur interne lors du traitement du webhook' });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  const plan = (session.metadata?.plan as 'premium' | 'student') || 'premium';

  if (!userId) {
    console.error('checkout.session.completed: userId manquant dans metadata');
    return;
  }

  const user = await User.findByPk(userId);
  if (!user) {
    console.error(`checkout.session.completed: utilisateur ${userId} non trouvé`);
    return;
  }

  // Récupérer les détails de l'abonnement Stripe
  let stripeSubId: string | null = null;

  if (session.subscription) {
    stripeSubId = session.subscription as string;
  }

  let stripePeriodEnd: Date | null = null;
  if (stripeSubId) {
    const stripeSub = await getStripe().subscriptions.retrieve(stripeSubId);
    const periodEnd = (stripeSub as any).current_period_end
      ?? stripeSub.items?.data?.[0]?.current_period_end;
    if (periodEnd) {
      stripePeriodEnd = new Date(periodEnd * 1000);
    }
  }

  // Activer isPremium sur l'utilisateur
  await user.update({ isPremium: true });

  // Créer ou mettre à jour l'abonnement en base
  const existingSub = await Subscription.findOne({ where: { userId, status: 'active' } });

  if (existingSub) {
    await existingSub.update({
      plan,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSubId || undefined,
      status: 'active',
      stripePeriodEnd
    });
  } else {
    await Subscription.create({
      userId,
      plan,
      status: 'active',
      startDate: new Date(),
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSubId || undefined,
      stripePeriodEnd
    });
  }

  // Envoyer l'email de confirmation d'abonnement (non-bloquant)
  sendSubscriptionEmail({
    to: user.getDataValue('email'),
    firstName: user.getDataValue('firstName'),
    plan,
  }).catch(err => console.error('Erreur envoi email abonnement:', err));

  console.log(`✅ Abonnement ${plan} activé pour l'utilisateur ${userId}`);
}

async function handleSubscriptionUpdated(stripeSub: Stripe.Subscription): Promise<void> {
  const stripeSubId = stripeSub.id;

  const subscription = await Subscription.findOne({ where: { stripeSubscriptionId: stripeSubId } });
  if (!subscription) {
    console.warn(`customer.subscription.updated: abonnement ${stripeSubId} non trouvé en base`);
    return;
  }

  const periodEnd = (stripeSub as any).current_period_end
    ?? stripeSub.items?.data?.[0]?.current_period_end;
  await subscription.update({
    status: stripeSub.status === 'active' ? 'active' : 'canceled',
    ...(periodEnd ? { stripePeriodEnd: new Date(periodEnd * 1000) } : {})
  });

  console.log(`✅ Abonnement ${stripeSubId} mis à jour: status=${stripeSub.status}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const stripeCustomerId = invoice.customer as string;

  const subscription = await Subscription.findOne({ where: { stripeCustomerId, status: 'active' } });
  if (!subscription) {
    console.warn(`invoice.payment_failed: pas d'abonnement actif pour ${stripeCustomerId}`);
    return;
  }

  const userId = subscription.getDataValue('userId');
  const user = await User.findByPk(userId);

  if (user) {
    sendPaymentFailedEmail({
      to: user.getDataValue('email'),
      firstName: user.getDataValue('firstName'),
    }).catch(err => console.error('Erreur envoi email paiement échoué:', err));
  }

  console.warn(`⚠️ Paiement échoué pour l'utilisateur ${userId} (customer: ${stripeCustomerId})`);
}

async function handleSubscriptionDeleted(stripeSub: Stripe.Subscription): Promise<void> {
  const stripeSubId = stripeSub.id;

  const subscription = await Subscription.findOne({ where: { stripeSubscriptionId: stripeSubId } });
  if (!subscription) {
    console.warn(`customer.subscription.deleted: abonnement ${stripeSubId} non trouvé en base`);
    return;
  }

  const userId = subscription.getDataValue('userId');
  await subscription.update({ status: 'canceled' });

  const user = await User.findByPk(userId);
  if (user) {
    await user.update({ isPremium: false });
    sendSubscriptionCancelledEmail({
      to: user.getDataValue('email'),
      firstName: user.getDataValue('firstName'),
    }).catch(err => console.error('Erreur envoi email annulation:', err));
  }

  console.log(`✅ Abonnement ${stripeSubId} annulé, isPremium=false pour l'utilisateur ${userId}`);
}

async function handleDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
  const stripeCustomerId = dispute.payment_intent
    ? (await getStripe().paymentIntents.retrieve(dispute.payment_intent as string)).customer as string
    : null;

  if (!stripeCustomerId) {
    console.warn(`charge.dispute.created: impossible de résoudre le customer pour la dispute ${dispute.id}`);
    return;
  }

  const subscription = await Subscription.findOne({ where: { stripeCustomerId } });
  if (!subscription) {
    console.warn(`charge.dispute.created: aucun abonnement trouvé pour customer ${stripeCustomerId}`);
    return;
  }

  const userId = subscription.getDataValue('userId');
  await subscription.update({ status: 'disputed' });

  const user = await User.findByPk(userId);
  if (user) {
    await user.update({ isPremium: false });
    sendDisputeOpenedEmail({
      to: user.getDataValue('email'),
      firstName: user.getDataValue('firstName'),
    }).catch(err => console.error('Erreur envoi email litige ouvert:', err));
  }

  console.warn(`⚠️ Litige ouvert — accès suspendu pour userId=${userId} (dispute: ${dispute.id})`);
}

async function handleDisputeClosed(dispute: Stripe.Dispute): Promise<void> {
  const stripeCustomerId = dispute.payment_intent
    ? (await getStripe().paymentIntents.retrieve(dispute.payment_intent as string)).customer as string
    : null;

  if (!stripeCustomerId) {
    console.warn(`charge.dispute.closed: impossible de résoudre le customer pour la dispute ${dispute.id}`);
    return;
  }

  const subscription = await Subscription.findOne({ where: { stripeCustomerId, status: 'disputed' } });
  if (!subscription) {
    console.warn(`charge.dispute.closed: aucun abonnement en litige pour customer ${stripeCustomerId}`);
    return;
  }

  const userId = subscription.getDataValue('userId');
  const user = await User.findByPk(userId);

  if (dispute.status === 'won') {
    // Litige gagné → on réactive l'abonnement
    await subscription.update({ status: 'active' });
    if (user) {
      await user.update({ isPremium: true });
      sendDisputeResolvedEmail({
        to: user.getDataValue('email'),
        firstName: user.getDataValue('firstName'),
      }).catch(err => console.error('Erreur envoi email litige résolu:', err));
    }
    console.log(`✅ Litige résolu (gagné) — accès rétabli pour userId=${userId}`);
  } else {
    // Litige perdu ou warning_closed → abonnement annulé définitivement
    await subscription.update({ status: 'canceled' });
    if (user) {
      await user.update({ isPremium: false });
    }
    console.warn(`⚠️ Litige résolu (${dispute.status}) — abonnement annulé pour userId=${userId}`);
  }
}

export default router;
