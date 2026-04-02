import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import StudentVerification from '../models/StudentVerification.js';

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
 * GET /api/subscriptions/prices
 * Retourne les prix Stripe pour les plans premium et student
 */
router.get('/prices', async (_req: Request, res: Response): Promise<void> => {
  try {
    const premiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    const studentPriceId = process.env.STRIPE_STUDENT_PRICE_ID;

    if (!premiumPriceId || !studentPriceId) {
      res.status(500).json({ success: false, message: 'Configuration Stripe manquante (PRICE_ID)' });
      return;
    }

    const [premiumPrice, studentPrice] = await Promise.all([
      getStripe().prices.retrieve(premiumPriceId),
      getStripe().prices.retrieve(studentPriceId),
    ]);

    const format = (price: { unit_amount: number | null; currency: string }) => {
      const amount = (price.unit_amount ?? 0) / 100;
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: price.currency }).format(amount);
    };

    res.json({
      success: true,
      data: {
        premium: format(premiumPrice as any),
        student: format(studentPrice as any),
      },
    });
  } catch (error: unknown) {
    console.error('Erreur récupération prix Stripe:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des prix' });
  }
});

/**
 * POST /api/subscriptions/checkout
 * Crée une Stripe Checkout Session (query param: ?plan=premium|student)
 */
router.post('/checkout', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const plan = (req.query.plan as string) || (req.body.plan as string) || 'premium';

    if (!['premium', 'student'].includes(plan)) {
      res.status(400).json({ success: false, message: 'Plan invalide. Utilisez "premium" ou "student".' });
      return;
    }

    const userId = (req.user as any).id;
    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      return;
    }

    // Pour le plan student, vérifier que la carte étudiante a été approuvée
    if (plan === 'student') {
      const verification = await StudentVerification.findOne({
        where: { userId, status: 'approved' }
      });

      if (!verification) {
        res.status(403).json({
          success: false,
          message: 'Votre carte étudiante doit être approuvée avant de souscrire au plan student.',
          code: 'STUDENT_VERIFICATION_REQUIRED'
        });
        return;
      }
    }

    // Chercher ou créer un Stripe customer
    let stripeCustomerId = user.getDataValue('stripeCustomerId');

    if (!stripeCustomerId) {
      const customer = await getStripe().customers.create({
        email: user.getDataValue('email'),
        metadata: { userId }
      });
      stripeCustomerId = customer.id;
      await user.update({ stripeCustomerId });
    }

    const priceId = plan === 'student'
      ? process.env.STRIPE_STUDENT_PRICE_ID
      : process.env.STRIPE_PREMIUM_PRICE_ID;

    if (!priceId) {
      res.status(500).json({ success: false, message: 'Configuration Stripe manquante (PRICE_ID)' });
      return;
    }

    const session = await getStripe().checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/chatbot`,
      cancel_url: `${process.env.FRONTEND_URL}/#title`,
      metadata: { userId, plan }
    });

    res.json({ success: true, url: session.url });
  } catch (error: unknown) {
    console.error('Erreur checkout Stripe:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la session de paiement' });
  }
});

/**
 * POST /api/subscriptions/portal
 * Crée une Stripe Customer Portal Session
 */
router.post('/portal', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      return;
    }

    const stripeCustomerId = user.getDataValue('stripeCustomerId');

    if (!stripeCustomerId) {
      res.status(400).json({ success: false, message: 'Aucun compte Stripe associé à cet utilisateur' });
      return;
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/profile`
    });

    res.json({ success: true, url: session.url });
  } catch (error: unknown) {
    console.error('Erreur portail Stripe:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création du portail de facturation' });
  }
});

/**
 * POST /api/subscriptions/cancel
 * Annuler l'abonnement à la fin de la période en cours
 */
router.post('/cancel', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any).id;

    const subscription = await Subscription.findOne({
      where: { userId, status: 'active' }
    });

    if (!subscription) {
      res.status(404).json({ success: false, message: 'Aucun abonnement actif trouvé' });
      return;
    }

    const stripeSubId = subscription.getDataValue('stripeSubscriptionId');

    if (!stripeSubId) {
      res.status(400).json({ success: false, message: 'Aucun abonnement Stripe associé' });
      return;
    }

    await getStripe().subscriptions.update(stripeSubId, { cancel_at_period_end: true });

    res.json({ success: true, message: 'Abonnement annulé à la fin de la période en cours' });
  } catch (error: unknown) {
    console.error('Erreur annulation Stripe:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'annulation de l\'abonnement' });
  }
});

/**
 * GET /api/subscriptions/current
 * Retourne le plan courant, statut et dates
 */
router.get('/current', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any).id;

    const subscription = await Subscription.findOne({
      where: { userId, status: 'active' },
      order: [['startDate', 'DESC']]
    });

    if (!subscription) {
      // Fallback : vérifier le flag is_premium sur l'utilisateur
      const user = await User.findByPk(userId);
      const isPremium = !!user?.getDataValue('isPremium');
      res.json({
        success: true,
        data: {
          plan: isPremium ? 'premium' : 'free',
          status: 'active',
          startDate: null,
          endDate: null,
          stripePeriodEnd: null
        }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        plan: subscription.getDataValue('plan'),
        status: subscription.getDataValue('status'),
        startDate: subscription.getDataValue('startDate'),
        endDate: subscription.getDataValue('endDate'),
        stripePeriodEnd: subscription.getDataValue('stripePeriodEnd')
      }
    });
  } catch (error: unknown) {
    console.error('Erreur récupération abonnement:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
  }
});

export default router;
