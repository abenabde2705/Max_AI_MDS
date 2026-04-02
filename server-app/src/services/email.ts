import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? 'Max AI <noreply@maxai-mds.fr>';
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

/**
 * Email envoyé par l'admin lors de la création manuelle d'un compte.
 * Contient un lien pour que l'utilisateur crée son mot de passe.
 */
export const sendSetPasswordEmail = async (opts: {
  to: string;
  firstName: string;
  token: string;
}) => {
  const link = `${FRONTEND_URL}/set-password?token=${opts.token}`;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: 'Bienvenue sur Max — Créez votre mot de passe',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="color-scheme" content="light" /><meta name="supported-color-schemes" content="light" /><style>:root{color-scheme:light;}</style></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Ubuntu',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1.5px solid #DAE63D;border-radius:24px;padding:48px 40px;">
              <tr><td>
                <h1 style="color:#161a4d;font-size:2rem;margin:0 0 8px;">max</h1>
                <h2 style="color:#161a4d;font-size:1.4rem;margin:0 0 24px;font-weight:400;">
                  Bonjour ${opts.firstName} 👋
                </h2>
                <p style="color:#555555;font-size:1rem;line-height:1.6;margin:0 0 32px;">
                  Un compte a été créé pour vous sur <strong style="color:#161a4d;">Max AI</strong>.<br/>
                  Cliquez sur le bouton ci-dessous pour définir votre mot de passe et accéder à votre espace.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td align="center" style="padding:0 0 32px;">
                    <a href="${link}"
                       style="display:inline-block;background:#DAE63D;color:#161a4d;text-decoration:none;
                              font-weight:700;font-size:1rem;padding:14px 36px;border-radius:50px;">
                      Créer mon mot de passe
                    </a>
                  </td></tr>
                </table>
                <p style="color:#999999;font-size:0.8rem;margin:0;text-align:center;">
                  Ce lien expire dans 24h. Si vous n'attendiez pas ce mail, ignorez-le.
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
};

/**
 * Email de bienvenue envoyé après l'inscription normale d'un utilisateur.
 */
export const sendWelcomeEmail = async (opts: { to: string; firstName: string }) => {
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: 'Bienvenue sur Max 🧠',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="color-scheme" content="light" /><meta name="supported-color-schemes" content="light" /><style>:root{color-scheme:light;}</style></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Ubuntu',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1.5px solid #DAE63D;border-radius:24px;padding:48px 40px;">
              <tr><td>
                <h1 style="color:#161a4d;font-size:2rem;margin:0 0 8px;">max</h1>
                <h2 style="color:#161a4d;font-size:1.4rem;margin:0 0 24px;font-weight:400;">
                  Bienvenue ${opts.firstName} 🎉
                </h2>
                <p style="color:#555555;font-size:1rem;line-height:1.6;margin:0 0 32px;">
                  Votre compte <strong style="color:#161a4d;">Max AI</strong> est prêt.<br/>
                  Max est votre compagnon de bien-être mental, disponible 24h/24, 7j/7, sans jugement.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td align="center" style="padding:0 0 32px;">
                    <a href="${FRONTEND_URL}/chatbot"
                       style="display:inline-block;background:#DAE63D;color:#161a4d;text-decoration:none;
                              font-weight:700;font-size:1rem;padding:14px 36px;border-radius:50px;">
                      Commencer à utiliser Max
                    </a>
                  </td></tr>
                </table>
                <p style="color:#999999;font-size:0.8rem;margin:0;text-align:center;">
                  Besoin d'aide ? Répondez à cet email, nous sommes là.
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
};

/**
 * Email de réinitialisation de mot de passe.
 */
export const sendPasswordResetEmail = async (opts: {
  to: string;
  firstName: string;
  token: string;
}) => {
  const link = `${FRONTEND_URL}/reset-password?token=${opts.token}`;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: 'Réinitialisation de votre mot de passe Max',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="color-scheme" content="light" /><meta name="supported-color-schemes" content="light" /><style>:root{color-scheme:light;}</style></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Ubuntu',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1.5px solid #DAE63D;border-radius:24px;padding:48px 40px;">
              <tr><td>
                <h1 style="color:#161a4d;font-size:2rem;margin:0 0 8px;">max</h1>
                <h2 style="color:#161a4d;font-size:1.4rem;margin:0 0 24px;font-weight:400;">
                  Bonjour ${opts.firstName} 👋
                </h2>
                <p style="color:#555555;font-size:1rem;line-height:1.6;margin:0 0 32px;">
                  Vous avez demandé à réinitialiser votre mot de passe <strong style="color:#161a4d;">Max AI</strong>.<br/>
                  Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td align="center" style="padding:0 0 32px;">
                    <a href="${link}"
                       style="display:inline-block;background:#DAE63D;color:#161a4d;text-decoration:none;
                              font-weight:700;font-size:1rem;padding:14px 36px;border-radius:50px;">
                      Réinitialiser mon mot de passe
                    </a>
                  </td></tr>
                </table>
                <p style="color:#999999;font-size:0.8rem;margin:0;text-align:center;">
                  Ce lien expire dans 1h. Si vous n'avez pas fait cette demande, ignorez cet email.
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
};

/**
 * Email envoyé quand un chargeback/litige est ouvert par l'utilisateur.
 */
export const sendDisputeOpenedEmail = async (opts: { to: string; firstName: string }) => {
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: 'Litige détecté sur votre compte Max — accès suspendu',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="color-scheme" content="light" /><meta name="supported-color-schemes" content="light" /><style>:root{color-scheme:light;}</style></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Ubuntu',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1.5px solid #ff4d4d;border-radius:24px;padding:48px 40px;">
              <tr><td>
                <h1 style="color:#161a4d;font-size:2rem;margin:0 0 8px;">max</h1>
                <h2 style="color:#161a4d;font-size:1.4rem;margin:0 0 24px;font-weight:400;">
                  Bonjour ${opts.firstName}
                </h2>
                <p style="color:#555555;font-size:1rem;line-height:1.6;margin:0 0 16px;">
                  Un <strong style="color:#ff4d4d;">litige (chargeback)</strong> a été ouvert auprès de votre banque concernant un paiement <strong style="color:#161a4d;">Max AI</strong>.
                </p>
                <p style="color:#555555;font-size:1rem;line-height:1.6;margin:0 0 32px;">
                  Votre accès premium a été <strong>suspendu</strong> le temps de la résolution du litige. Si vous pensez qu'il s'agit d'une erreur, contactez-nous en répondant à cet email.
                </p>
                <p style="color:#999999;font-size:0.8rem;margin:0;text-align:center;">
                  Votre accès sera rétabli automatiquement si le litige est résolu en votre faveur.
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
};

/**
 * Email envoyé quand un litige est résolu (gagné = accès rétabli).
 */
export const sendDisputeResolvedEmail = async (opts: { to: string; firstName: string }) => {
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: 'Litige résolu — votre accès Max est rétabli',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="color-scheme" content="light" /><meta name="supported-color-schemes" content="light" /><style>:root{color-scheme:light;}</style></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Ubuntu',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1.5px solid #DAE63D;border-radius:24px;padding:48px 40px;">
              <tr><td>
                <h1 style="color:#161a4d;font-size:2rem;margin:0 0 8px;">max</h1>
                <h2 style="color:#161a4d;font-size:1.4rem;margin:0 0 24px;font-weight:400;">
                  Bonjour ${opts.firstName} 👋
                </h2>
                <p style="color:#555555;font-size:1rem;line-height:1.6;margin:0 0 32px;">
                  Le litige sur votre compte a été résolu. Votre accès <strong style="color:#161a4d;">Max AI</strong> est désormais <strong>rétabli</strong>.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td align="center" style="padding:0 0 32px;">
                    <a href="${FRONTEND_URL}/chatbot"
                       style="display:inline-block;background:#DAE63D;color:#161a4d;text-decoration:none;
                              font-weight:700;font-size:1rem;padding:14px 36px;border-radius:50px;">
                      Accéder à Max
                    </a>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
};

/**
 * Email envoyé quand un paiement échoue (renouvellement).
 */
export const sendPaymentFailedEmail = async (opts: { to: string; firstName: string }) => {
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: 'Problème de paiement sur votre abonnement Max',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="color-scheme" content="light" /><meta name="supported-color-schemes" content="light" /><style>:root{color-scheme:light;}</style></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Ubuntu',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1.5px solid #ff4d4d;border-radius:24px;padding:48px 40px;">
              <tr><td>
                <h1 style="color:#161a4d;font-size:2rem;margin:0 0 8px;">max</h1>
                <h2 style="color:#161a4d;font-size:1.4rem;margin:0 0 24px;font-weight:400;">
                  Bonjour ${opts.firstName} 👋
                </h2>
                <p style="color:#555555;font-size:1rem;line-height:1.6;margin:0 0 16px;">
                  Nous n'avons pas pu encaisser le paiement de votre abonnement <strong style="color:#161a4d;">Max AI</strong>.
                </p>
                <p style="color:#555555;font-size:1rem;line-height:1.6;margin:0 0 32px;">
                  Veuillez mettre à jour votre moyen de paiement pour continuer à profiter de votre abonnement.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td align="center" style="padding:0 0 32px;">
                    <a href="${FRONTEND_URL}/profile"
                       style="display:inline-block;background:#DAE63D;color:#161a4d;text-decoration:none;
                              font-weight:700;font-size:1rem;padding:14px 36px;border-radius:50px;">
                      Mettre à jour mon paiement
                    </a>
                  </td></tr>
                </table>
                <p style="color:#999999;font-size:0.8rem;margin:0;text-align:center;">
                  Si vous avez des questions, répondez à cet email.
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
};

/**
 * Email envoyé quand un abonnement est annulé.
 */
export const sendSubscriptionCancelledEmail = async (opts: { to: string; firstName: string }) => {
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: 'Votre abonnement Max a été annulé',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="color-scheme" content="light" /><meta name="supported-color-schemes" content="light" /><style>:root{color-scheme:light;}</style></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Ubuntu',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1.5px solid #DAE63D;border-radius:24px;padding:48px 40px;">
              <tr><td>
                <h1 style="color:#161a4d;font-size:2rem;margin:0 0 8px;">max</h1>
                <h2 style="color:#161a4d;font-size:1.4rem;margin:0 0 24px;font-weight:400;">
                  Abonnement annulé, ${opts.firstName}
                </h2>
                <p style="color:#555555;font-size:1rem;line-height:1.6;margin:0 0 16px;">
                  Votre abonnement <strong style="color:#161a4d;">Max AI</strong> a bien été annulé.
                </p>
                <p style="color:#555555;font-size:1rem;line-height:1.6;margin:0 0 32px;">
                  Vous conservez l'accès au plan gratuit (10 messages/jour). Vous pouvez vous réabonner à tout moment depuis votre profil.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td align="center" style="padding:0 0 32px;">
                    <a href="${FRONTEND_URL}/abonnement"
                       style="display:inline-block;background:#DAE63D;color:#161a4d;text-decoration:none;
                              font-weight:700;font-size:1rem;padding:14px 36px;border-radius:50px;">
                      Voir les offres
                    </a>
                  </td></tr>
                </table>
                <p style="color:#999999;font-size:0.8rem;margin:0;text-align:center;">
                  Besoin d'aide ? Répondez à cet email.
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
};

/**
 * Email envoyé à l'étudiant quand sa vérification est approuvée ou rejetée.
 */
export const sendStudentVerificationStatusEmail = async (opts: {
  to: string;
  firstName: string;
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}) => {
  const isApproved = opts.status === 'approved';
  const subject = isApproved
    ? 'Votre vérification étudiante est approuvée ✅'
    : 'Votre vérification étudiante a été refusée';

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="color-scheme" content="light" /><meta name="supported-color-schemes" content="light" /><style>:root{color-scheme:light;}</style></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Ubuntu',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#161a4d 0%,#470059 100%);border:1.5px solid ${isApproved ? '#DAE63D' : '#ff4d4d'};border-radius:24px;padding:48px 40px;">
              <tr><td>
                <h1 style="color:#161a4d;font-size:2rem;margin:0 0 8px;">max</h1>
                <h2 style="color:#161a4d;font-size:1.4rem;margin:0 0 24px;font-weight:400;">
                  Bonjour ${opts.firstName} 👋
                </h2>
                ${isApproved ? `
                <p style="color:#555555;font-size:1rem;line-height:1.6;margin:0 0 16px;">
                  Bonne nouvelle ! Votre carte étudiante a été <strong style="color:#161a4d;">vérifiée et approuvée</strong>.
                </p>
                <p style="color:#555555;font-size:1rem;line-height:1.6;margin:0 0 32px;">
                  Vous pouvez maintenant finaliser votre abonnement Campus à 7,99€/mois.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td align="center" style="padding:0 0 32px;">
                    <a href="${FRONTEND_URL}/abonnement"
                       style="display:inline-block;background:#DAE63D;color:#161a4d;text-decoration:none;
                              font-weight:700;font-size:1rem;padding:14px 36px;border-radius:50px;">
                      Finaliser mon abonnement Campus
                    </a>
                  </td></tr>
                </table>
                ` : `
                <p style="color:#555555;font-size:1rem;line-height:1.6;margin:0 0 16px;">
                  Votre demande de vérification étudiante a été <strong style="color:#ff4d4d;">refusée</strong>.
                </p>
                ${opts.rejectionReason ? `
                <p style="color:#666666;font-size:0.9rem;line-height:1.6;margin:0 0 24px;padding:16px;background:rgba(255,77,77,0.1);border-radius:8px;border-left:3px solid #ff4d4d;">
                  Motif : ${opts.rejectionReason}
                </p>
                ` : ''}
                <p style="color:#555555;font-size:1rem;line-height:1.6;margin:0 0 32px;">
                  Vous pouvez soumettre une nouvelle carte depuis votre espace abonnement.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td align="center" style="padding:0 0 32px;">
                    <a href="${FRONTEND_URL}/abonnement"
                       style="display:inline-block;background:#DAE63D;color:#161a4d;text-decoration:none;
                              font-weight:700;font-size:1rem;padding:14px 36px;border-radius:50px;">
                      Soumettre une nouvelle carte
                    </a>
                  </td></tr>
                </table>
                `}
                <p style="color:#999999;font-size:0.8rem;margin:0;text-align:center;">
                  Besoin d'aide ? Répondez à cet email.
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
};

/**
 * Email de confirmation d'inscription à la newsletter.
 */
export const sendNewsletterWelcomeEmail = async (opts: { to: string }) => {
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: 'Vous êtes inscrit(e) à la newsletter Max',
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="color-scheme" content="light" /><meta name="supported-color-schemes" content="light" /><style>:root{color-scheme:light;}</style></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Ubuntu',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1.5px solid #DAE63D;border-radius:24px;padding:48px 40px;">
              <tr><td>
                <h1 style="color:#161a4d;font-size:2rem;margin:0 0 8px;">max</h1>
                <h2 style="color:#161a4d;font-size:1.4rem;margin:0 0 24px;font-weight:400;">
                  Bienvenue dans la newsletter Max !
                </h2>
                <p style="color:#555555;font-size:1rem;line-height:1.6;margin:0 0 32px;">
                  Vous recevrez bientôt nos conseils bien-être, les dernières nouveautés de <strong style="color:#161a4d;">Max</strong> et des ressources en santé mentale — directement dans votre boîte mail.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td align="center" style="padding:0 0 32px;">
                    <a href="${FRONTEND_URL}"
                       style="display:inline-block;background:#DAE63D;color:#161a4d;text-decoration:none;
                              font-weight:700;font-size:1rem;padding:14px 36px;border-radius:50px;">
                      Découvrir Max
                    </a>
                  </td></tr>
                </table>
                <p style="color:#999999;font-size:0.8rem;margin:0;text-align:center;">
                  Pour vous désinscrire, rendez-vous dans les paramètres de votre profil.
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
};

/**
 * Email de confirmation d'abonnement.
 */
export const sendSubscriptionEmail = async (opts: {
  to: string;
  firstName: string;
  plan: 'premium' | 'student';
}) => {
  const planLabel = opts.plan === 'premium' ? 'Premium (14,99€/mois)' : 'Campus (7,99€/mois)';
  const planPerks = opts.plan === 'premium'
    ? 'Messages illimités, journal émotionnel, statistiques avancées et accès aux coachs.'
    : 'Messages illimités et accès aux fonctionnalités premium au tarif étudiant.';

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Votre abonnement ${opts.plan === 'premium' ? 'Premium' : 'Campus'} est actif ✅`,
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta name="color-scheme" content="light" /><meta name="supported-color-schemes" content="light" /><style>:root{color-scheme:light;}</style></head>
      <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Ubuntu',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1.5px solid #DAE63D;border-radius:24px;padding:48px 40px;">
              <tr><td>
                <h1 style="color:#161a4d;font-size:2rem;margin:0 0 8px;">max</h1>
                <h2 style="color:#161a4d;font-size:1.4rem;margin:0 0 16px;font-weight:400;">
                  Merci ${opts.firstName} ! 🙌
                </h2>
                <p style="color:#555555;font-size:1rem;line-height:1.6;margin:0 0 16px;">
                  Votre abonnement <strong style="color:#161a4d;">${planLabel}</strong> est maintenant actif.
                </p>
                <p style="color:#555555;font-size:1rem;line-height:1.6;margin:0 0 32px;">
                  ${planPerks}
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td align="center" style="padding:0 0 32px;">
                    <a href="${FRONTEND_URL}/chatbot"
                       style="display:inline-block;background:#DAE63D;color:#161a4d;text-decoration:none;
                              font-weight:700;font-size:1rem;padding:14px 36px;border-radius:50px;">
                      Accéder à Max
                    </a>
                  </td></tr>
                </table>
                <p style="color:#999999;font-size:0.8rem;margin:0;text-align:center;">
                  Vous pouvez gérer votre abonnement depuis votre profil.
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
};
