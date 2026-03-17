import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/img/logomax.png';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section style={{ marginBottom: '2.5rem' }}>
    <h2 style={{ color: '#DAE63D', fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', borderBottom: '1px solid rgba(218,230,61,0.2)', paddingBottom: '0.4rem' }}>
      {title}
    </h2>
    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', lineHeight: 1.75 }}>
      {children}
    </div>
  </section>
);

const ConditionsUtilisation: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#0d0626', fontFamily: '\'Ubuntu\', Arial, sans-serif', padding: '40px 16px 80px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Link to="/">
            <img src={logoImg} alt="Max" style={{ height: '48px', marginBottom: '1.5rem' }} />
          </Link>
          <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            Conditions Générales d&apos;Utilisation
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            Dernière mise à jour : 17 mars 2026
          </p>
        </div>

        {/* Content */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(218,230,61,0.15)', borderRadius: '16px', padding: '2.5rem 2rem' }}>

          <Section title="1. Présentation du service">
            <p>
              Max AI (ci-après « Max » ou « le Service ») est une plateforme de soutien en santé mentale proposant un chatbot conversationnel alimenté par intelligence artificielle. Max est édité par Max AI SAS, société par actions simplifiée immatriculée en France.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              Le Service est accessible à l&apos;adresse <strong style={{ color: '#DAE63D' }}>maxai-mds.fr</strong> et s&apos;adresse à toute personne souhaitant bénéficier d&apos;un accompagnement quotidien en matière de bien-être mental.
            </p>
            <p style={{ marginTop: '0.75rem', padding: '1rem', background: 'rgba(218,230,61,0.06)', borderRadius: '8px', borderLeft: '3px solid #DAE63D' }}>
              <strong style={{ color: '#DAE63D' }}>Important :</strong> Max n&apos;est pas un service médical. Il ne remplace pas un professionnel de santé mental (psychiatre, psychologue, médecin). En cas de détresse psychologique grave ou d&apos;urgence, contactez le <strong style={{ color: '#fff' }}>15 (SAMU)</strong>, le <strong style={{ color: '#fff' }}>3114 (numéro national prévention suicide)</strong> ou les services d&apos;urgence.
            </p>
          </Section>

          <Section title="2. Accès au service et création de compte">
            <p>L&apos;utilisation de Max nécessite la création d&apos;un compte personnel. Pour s&apos;inscrire, l&apos;utilisateur doit :</p>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Être âgé d&apos;au moins 13 ans ;</li>
              <li>Fournir une adresse email valide et un mot de passe sécurisé, ou s&apos;authentifier via Google ou Facebook ;</li>
              <li>Accepter les présentes CGU et la Politique de confidentialité.</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>
              L&apos;utilisateur est responsable de la confidentialité de ses identifiants et de toute activité réalisée depuis son compte. En cas de compromission, il doit en informer Max AI sans délai.
            </p>
          </Section>

          <Section title="3. Offres et tarification">
            <p>Max propose trois formules d&apos;abonnement :</p>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: 'Gratuit', price: '0 €', desc: '10 messages par jour, accès limité aux fonctionnalités.' },
                { name: 'Premium', price: '14,99 € / mois', desc: 'Messages illimités, journal émotionnel, statistiques avancées, accès aux coachs.' },
                { name: 'Campus (étudiant)', price: '8,00 € / mois', desc: 'Mêmes avantages que Premium, sous réserve de vérification du statut étudiant.' },
              ].map(plan => (
                <div key={plan.name} style={{ padding: '0.875rem 1.1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <strong style={{ color: '#fff' }}>{plan.name}</strong>
                    <span style={{ color: '#DAE63D', fontWeight: 700 }}>{plan.price}</span>
                  </div>
                  <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)' }}>{plan.desc}</span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '0.75rem' }}>
              Les prix sont indiqués TTC. Max AI se réserve le droit de modifier ses tarifs avec un préavis de 30 jours notifié par email.
            </p>
          </Section>

          <Section title="4. Paiement et facturation">
            <p>
              Les paiements sont traités par <strong style={{ color: '#fff' }}>Stripe</strong>, prestataire de paiement sécurisé (PCI-DSS). Max AI ne stocke aucune donnée bancaire sur ses serveurs.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              L&apos;abonnement est facturé mensuellement à la date de souscription. En cas d&apos;échec de paiement, Max AI tentera de débiter le compte dans les jours suivants avant de suspendre l&apos;accès Premium.
            </p>
          </Section>

          <Section title="5. Résiliation et remboursement">
            <p>
              L&apos;utilisateur peut résilier son abonnement à tout moment depuis la rubrique <strong style={{ color: '#fff' }}>Mon profil → Gérer mon abonnement</strong>. La résiliation prend effet à la fin de la période en cours déjà payée.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              Conformément à l&apos;article L.221-18 du Code de la consommation, l&apos;utilisateur dispose d&apos;un droit de rétractation de <strong style={{ color: '#fff' }}>14 jours</strong> à compter de la souscription. Pour l&apos;exercer, contactez <strong style={{ color: '#DAE63D' }}>contact@maxai-mds.fr</strong>.
            </p>
          </Section>

          <Section title="6. Vérification du statut étudiant">
            <p>
              L&apos;abonnement Campus est réservé aux étudiants disposant d&apos;une carte étudiante ou d&apos;un certificat de scolarité en cours de validité. Le document est examiné par l&apos;équipe Max AI dans un délai de 2 à 5 jours ouvrés.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              Toute fraude à la vérification entraîne la résiliation immédiate du compte et le remboursement de la différence au tarif Premium.
            </p>
          </Section>

          <Section title="7. Propriété intellectuelle">
            <p>
              L&apos;ensemble des contenus du Service (textes, interface, logo, algorithmes, modèles d&apos;IA) est la propriété exclusive de Max AI SAS ou de ses partenaires. Toute reproduction, distribution ou exploitation sans autorisation écrite est interdite.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              Les conversations générées par Max peuvent être utilisées de façon anonymisée pour améliorer le Service, dans le respect de la réglementation RGPD.
            </p>
          </Section>

          <Section title="8. Limitation de responsabilité">
            <p>Max AI s&apos;engage à maintenir une disponibilité maximale du Service mais ne garantit pas une disponibilité ininterrompue. En cas d&apos;indisponibilité planifiée, les utilisateurs en seront informés à l&apos;avance.</p>
            <p style={{ marginTop: '0.75rem' }}>Max AI décline toute responsabilité :</p>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Pour les décisions prises par l&apos;utilisateur sur la base des réponses du chatbot ;</li>
              <li>En cas d&apos;usage du Service en substitution d&apos;un suivi médical professionnel ;</li>
              <li>Pour tout dommage indirect résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser le Service.</li>
            </ul>
          </Section>

          <Section title="9. Comportement des utilisateurs">
            <p>Il est interdit d&apos;utiliser Max pour :</p>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Diffuser des contenus illicites, haineux ou harcelants ;</li>
              <li>Tenter de contourner les mesures de sécurité ou d&apos;extraire les données d&apos;autres utilisateurs ;</li>
              <li>Utiliser des scripts ou robots pour automatiser l&apos;accès au Service.</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>Tout manquement peut entraîner la suspension immédiate du compte, sans remboursement.</p>
          </Section>

          <Section title="10. Modifications des CGU">
            <p>
              Max AI se réserve le droit de modifier les présentes CGU. Toute modification substantielle sera notifiée par email au moins 30 jours avant son entrée en vigueur. La poursuite de l&apos;utilisation du Service après cette date vaut acceptation des nouvelles conditions.
            </p>
          </Section>

          <Section title="11. Droit applicable et litiges">
            <p>
              Les présentes CGU sont régies par le droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux compétents de Paris seront seuls compétents.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              Conformément à l&apos;article L.612-1 du Code de la consommation, vous pouvez recourir gratuitement à un médiateur de la consommation.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>Pour toute question relative aux présentes CGU :</p>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Email : <strong style={{ color: '#DAE63D' }}>contact@maxai-mds.fr</strong></li>
              <li>Adresse : Max AI SAS, France</li>
            </ul>
          </Section>

        </div>

        {/* Footer nav */}
        <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Retour à l&apos;accueil
          </Link>
          <Link to="/politics/politique-confidentialites" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none' }}>
            Politique de confidentialité →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConditionsUtilisation;
