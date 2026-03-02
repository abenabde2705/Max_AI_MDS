import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

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
        console.warn('Paiement échoué pour le client:', invoice.customer);
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

  // Activer isPremium sur l'utilisateur
  await user.update({ isPremium: true });

  // Créer ou mettre à jour l'abonnement en base
  const existingSub = await Subscription.findOne({ where: { userId, status: 'active' } });

  if (existingSub) {
    await existingSub.update({
      plan,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSubId || undefined,
      status: 'active'
    });
  } else {
    await Subscription.create({
      userId,
      plan,
      status: 'active',
      startDate: new Date(),
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSubId || undefined
    });
  }

  console.log(`✅ Abonnement ${plan} activé pour l'utilisateur ${userId}`);
}

async function handleSubscriptionUpdated(stripeSub: Stripe.Subscription): Promise<void> {
  const stripeSubId = stripeSub.id;

  const subscription = await Subscription.findOne({ where: { stripeSubscriptionId: stripeSubId } });
  if (!subscription) {
    console.warn(`customer.subscription.updated: abonnement ${stripeSubId} non trouvé en base`);
    return;
  }

  await subscription.update({
    status: stripeSub.status === 'active' ? 'active' : 'canceled'
  });

  console.log(`✅ Abonnement ${stripeSubId} mis à jour: status=${stripeSub.status}`);
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
  }

  console.log(`✅ Abonnement ${stripeSubId} annulé, isPremium=false pour l'utilisateur ${userId}`);
}

export default router;
