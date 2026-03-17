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

const PolitiqueConfidentialites: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#0d0626', fontFamily: '\'Ubuntu\', Arial, sans-serif', padding: '40px 16px 80px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Link to="/">
            <img src={logoImg} alt="Max" style={{ height: '48px', marginBottom: '1.5rem' }} />
          </Link>
          <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            Politique de Confidentialité
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            Dernière mise à jour : 17 mars 2026
          </p>
        </div>

        {/* Content */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(218,230,61,0.15)', borderRadius: '16px', padding: '2.5rem 2rem' }}>

          <Section title="1. Responsable du traitement">
            <p>
              Le responsable du traitement des données personnelles collectées via Max est <strong style={{ color: '#fff' }}>Max AI SAS</strong>, joignable à l&apos;adresse <strong style={{ color: '#DAE63D' }}>contact@maxai-mds.fr</strong>.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              Max AI s&apos;engage à traiter vos données personnelles dans le respect du <strong style={{ color: '#fff' }}>Règlement Général sur la Protection des Données (RGPD)</strong> et de la loi Informatique et Libertés.
            </p>
          </Section>

          <Section title="2. Données collectées">
            <p>Nous collectons les données suivantes selon votre utilisation :</p>

            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                {
                  cat: 'Données d\'identité',
                  items: 'Prénom, nom, adresse email, date de naissance, photo de profil (optionnelle).',
                },
                {
                  cat: 'Données de connexion',
                  items: 'Adresse IP, navigateur, système d\'exploitation, horodatage des connexions.',
                },
                {
                  cat: 'Données de conversation',
                  items: 'Messages échangés avec le chatbot Max, identifiant de conversation, date et heure des messages.',
                },
                {
                  cat: 'Données d\'abonnement',
                  items: 'Plan souscrit, identifiant Stripe (aucune donnée bancaire stockée), statut étudiant.',
                },
                {
                  cat: 'Journal émotionnel',
                  items: 'Entrées du journal générées automatiquement par l\'IA à partir de vos conversations (plan Premium uniquement).',
                },
                {
                  cat: 'Données de vérification étudiante',
                  items: 'Document justificatif téléchargé (carte étudiante ou certificat de scolarité), supprimé après vérification.',
                },
              ].map(row => (
                <div key={row.cat} style={{ padding: '0.875rem 1.1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <strong style={{ color: '#fff', display: 'block', marginBottom: '0.25rem' }}>{row.cat}</strong>
                  <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.55)' }}>{row.items}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="3. Finalités et bases légales du traitement">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
              {[
                { finalite: 'Création et gestion de votre compte', base: 'Exécution du contrat' },
                { finalite: 'Fourniture du service de chatbot', base: 'Exécution du contrat' },
                { finalite: 'Traitement des paiements et abonnements', base: 'Exécution du contrat' },
                { finalite: 'Envoi d\'emails transactionnels (bienvenue, reset mdp, confirmation abonnement)', base: 'Exécution du contrat' },
                { finalite: 'Détection de situations de crise et alertes de sécurité', base: 'Intérêt légitime (protection de l\'utilisateur)' },
                { finalite: 'Amélioration du service et statistiques anonymisées', base: 'Intérêt légitime' },
                { finalite: 'Respect des obligations légales', base: 'Obligation légale' },
              ].map(row => (
                <div key={row.finalite} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'start', padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.9rem' }}>{row.finalite}</span>
                  <span style={{ fontSize: '0.8rem', color: '#DAE63D', whiteSpace: 'nowrap', textAlign: 'right' }}>{row.base}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="4. Durée de conservation">
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li><strong style={{ color: '#fff' }}>Données de compte</strong> : conservées pendant toute la durée de votre utilisation du Service, puis 3 ans après votre dernière connexion.</li>
              <li style={{ marginTop: '0.5rem' }}><strong style={{ color: '#fff' }}>Conversations</strong> : conservées 12 mois glissants, puis supprimées automatiquement.</li>
              <li style={{ marginTop: '0.5rem' }}><strong style={{ color: '#fff' }}>Journal émotionnel</strong> : conservé jusqu&apos;à suppression manuelle par l&apos;utilisateur.</li>
              <li style={{ marginTop: '0.5rem' }}><strong style={{ color: '#fff' }}>Données de paiement</strong> : conservées 10 ans conformément aux obligations comptables légales.</li>
              <li style={{ marginTop: '0.5rem' }}><strong style={{ color: '#fff' }}>Documents étudiants</strong> : supprimés dans les 7 jours suivant la vérification.</li>
              <li style={{ marginTop: '0.5rem' }}><strong style={{ color: '#fff' }}>Alertes de crise</strong> : conservées 6 mois, accessibles uniquement aux administrateurs.</li>
            </ul>
          </Section>

          <Section title="5. Partage des données">
            <p>Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec :</p>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li><strong style={{ color: '#fff' }}>Stripe</strong> — traitement sécurisé des paiements (PCI-DSS) ;</li>
              <li><strong style={{ color: '#fff' }}>Resend</strong> — envoi d&apos;emails transactionnels ;</li>
              <li><strong style={{ color: '#fff' }}>Firebase / Google</strong> — authentification OAuth et stockage en temps réel ;</li>
              <li><strong style={{ color: '#fff' }}>Prestataires d&apos;hébergement</strong> — serveurs situés dans l&apos;Union Européenne.</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>
              Chaque sous-traitant est lié par un contrat garantissant le respect du RGPD.
            </p>
          </Section>

          <Section title="6. Transferts hors UE">
            <p>
              Certains prestataires (Firebase, Stripe) peuvent traiter des données en dehors de l&apos;Union Européenne. Ces transferts sont encadrés par des <strong style={{ color: '#fff' }}>clauses contractuelles types</strong> approuvées par la Commission Européenne ou par des décisions d&apos;adéquation.
            </p>
          </Section>

          <Section title="7. Sécurité des données">
            <p>Max AI met en œuvre les mesures de sécurité suivantes :</p>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Chiffrement des communications (HTTPS/TLS) ;</li>
              <li>Mots de passe hachés avec bcrypt ;</li>
              <li>Authentification par tokens JWT à durée limitée ;</li>
              <li>Accès aux données restreint par rôle (RBAC) ;</li>
              <li>Surveillance des anomalies via Prometheus et Grafana.</li>
            </ul>
          </Section>

          <Section title="8. Cookies">
            <p>Max AI utilise uniquement des cookies techniques strictement nécessaires au fonctionnement du Service :</p>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li><strong style={{ color: '#fff' }}>Token d&apos;authentification</strong> — stocké en localStorage ou sessionStorage selon votre choix « Rester connecté(e) » ;</li>
              <li><strong style={{ color: '#fff' }}>Préférences de session</strong> — stockées localement, non transmises à des tiers.</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>
              Aucun cookie publicitaire ou de suivi tiers n&apos;est déposé sur votre appareil.
            </p>
          </Section>

          <Section title="9. Vos droits RGPD">
            <p>Conformément au RGPD, vous disposez des droits suivants sur vos données :</p>
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {[
                { droit: 'Droit d\'accès', desc: 'Obtenir une copie de vos données.' },
                { droit: 'Droit de rectification', desc: 'Corriger des données inexactes.' },
                { droit: 'Droit à l\'effacement', desc: 'Demander la suppression de votre compte.' },
                { droit: 'Droit à la portabilité', desc: 'Recevoir vos données dans un format lisible.' },
                { droit: 'Droit d\'opposition', desc: 'Vous opposer à certains traitements.' },
                { droit: 'Droit à la limitation', desc: 'Suspendre temporairement un traitement.' },
              ].map(r => (
                <div key={r.droit} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <strong style={{ color: '#DAE63D', display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{r.droit}</strong>
                  <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)' }}>{r.desc}</span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '1rem' }}>
              Pour exercer ces droits, contactez-nous à <strong style={{ color: '#DAE63D' }}>contact@maxai-mds.fr</strong>. Nous répondons dans un délai maximum de <strong style={{ color: '#fff' }}>30 jours</strong>.
            </p>
            <p style={{ marginTop: '0.75rem' }}>
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la <strong style={{ color: '#fff' }}>CNIL</strong> (www.cnil.fr).
            </p>
          </Section>

          <Section title="10. Détection de crise — traitement particulier">
            <p>
              Max analyse en temps réel le contenu de vos messages afin de détecter des signaux de détresse psychologique grave (mots-clés liés au suicide ou à l&apos;automutilation). En cas de détection :
            </p>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Une alerte est crée et accessible aux administrateurs de Max AI ;</li>
              <li>Le chatbot vous oriente vers des ressources d&apos;aide d&apos;urgence (3114, 15) ;</li>
              <li>Ces alertes sont conservées 6 mois puis supprimées.</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>
              Ce traitement est fondé sur l&apos;intérêt légitime de Max AI à protéger la sécurité de ses utilisateurs.
            </p>
          </Section>

          <Section title="11. Modifications de la politique">
            <p>
              Max AI peut modifier la présente politique à tout moment. Toute modification substantielle sera notifiée par email au moins 15 jours avant son entrée en vigueur. La version en vigueur est toujours accessible sur cette page avec sa date de mise à jour.
            </p>
          </Section>

          <Section title="12. Contact et DPO">
            <p>Pour toute question relative à la protection de vos données :</p>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Email : <strong style={{ color: '#DAE63D' }}>contact@maxai-mds.fr</strong></li>
              <li>Adresse : Max AI SAS, 40 Rue du Chemin Vert, 75011 Paris, France</li>
            </ul>
          </Section>

        </div>

        {/* Footer nav */}
        <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Retour à l&apos;accueil
          </Link>
          <Link to="/politics/conditions-utilisation" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textDecoration: 'none' }}>
            Conditions d&apos;utilisation →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PolitiqueConfidentialites;
