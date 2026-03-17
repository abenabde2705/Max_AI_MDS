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
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body style="margin:0;padding:0;background:#0d0626;font-family:'Ubuntu',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0626;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#161a4d 0%,#470059 100%);border:1.5px solid #DAE63D;border-radius:24px;padding:48px 40px;">
              <tr><td>
                <h1 style="color:#DAE63D;font-size:2rem;margin:0 0 8px;">max</h1>
                <h2 style="color:#fff;font-size:1.4rem;margin:0 0 24px;font-weight:400;">
                  Bonjour ${opts.firstName} 👋
                </h2>
                <p style="color:rgba(255,255,255,0.8);font-size:1rem;line-height:1.6;margin:0 0 32px;">
                  Un compte a été créé pour vous sur <strong style="color:#DAE63D;">Max AI</strong>.<br/>
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
                <p style="color:rgba(255,255,255,0.4);font-size:0.8rem;margin:0;text-align:center;">
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
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body style="margin:0;padding:0;background:#0d0626;font-family:'Ubuntu',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0626;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#161a4d 0%,#470059 100%);border:1.5px solid #DAE63D;border-radius:24px;padding:48px 40px;">
              <tr><td>
                <h1 style="color:#DAE63D;font-size:2rem;margin:0 0 8px;">max</h1>
                <h2 style="color:#fff;font-size:1.4rem;margin:0 0 24px;font-weight:400;">
                  Bienvenue ${opts.firstName} 🎉
                </h2>
                <p style="color:rgba(255,255,255,0.8);font-size:1rem;line-height:1.6;margin:0 0 32px;">
                  Votre compte <strong style="color:#DAE63D;">Max AI</strong> est prêt.<br/>
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
                <p style="color:rgba(255,255,255,0.4);font-size:0.8rem;margin:0;text-align:center;">
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
 * Email de confirmation d'abonnement.
 */
export const sendSubscriptionEmail = async (opts: {
  to: string;
  firstName: string;
  plan: 'premium' | 'student';
}) => {
  const planLabel = opts.plan === 'premium' ? 'Premium (14,99€/mois)' : 'Campus (8€/mois)';
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
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body style="margin:0;padding:0;background:#0d0626;font-family:'Ubuntu',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0626;padding:40px 0;">
          <tr><td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#161a4d 0%,#470059 100%);border:1.5px solid #DAE63D;border-radius:24px;padding:48px 40px;">
              <tr><td>
                <h1 style="color:#DAE63D;font-size:2rem;margin:0 0 8px;">max</h1>
                <h2 style="color:#fff;font-size:1.4rem;margin:0 0 16px;font-weight:400;">
                  Merci ${opts.firstName} ! 🙌
                </h2>
                <p style="color:rgba(255,255,255,0.8);font-size:1rem;line-height:1.6;margin:0 0 16px;">
                  Votre abonnement <strong style="color:#DAE63D;">${planLabel}</strong> est maintenant actif.
                </p>
                <p style="color:rgba(255,255,255,0.8);font-size:1rem;line-height:1.6;margin:0 0 32px;">
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
                <p style="color:rgba(255,255,255,0.4);font-size:0.8rem;margin:0;text-align:center;">
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
