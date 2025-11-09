const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();
const db = admin.firestore();

// Configurez votre clé API SendGrid
sgMail.setApiKey("VOTRE_SENDGRID_API_KEY");

// Fonction pour envoyer un email après l'ajout d'un témoignage
exports.sendTestimonialEmail = functions.firestore
  .document("testimonials/{testimonialId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();

    const msg = {
      to: data.email, // Email de l'utilisateur
      from: "no-reply@max.com", // Adresse email de l'expéditeur
      subject: "Merci pour votre témoignage !",
      text: `Bonjour ${data.firstName},\n\nMerci pour votre témoignage ! Nous apprécions votre contribution.\n\nCordialement,\nL'équipe Max`,
      html: `<p>Bonjour ${data.firstName},</p><p>Merci pour votre témoignage ! Nous apprécions votre contribution.</p><p>Cordialement,<br>L'équipe Max</p>`,
    };

    try {
      await sgMail.send(msg);
      console.log("Email envoyé avec succès à :", data.email);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email :", error);
    }
  });

// Fonction pour envoyer un email après l'inscription à la newsletter
exports.sendNewsletterEmail = functions.firestore
  .document("newsletter/{newsletterId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();

    const msg = {
      to: data.email, // Email de l'utilisateur
      from: "no-reply@max.com", // Adresse email de l'expéditeur
      subject: "Bienvenue dans la newsletter Max !",
      text: `Bonjour,\n\nMerci de vous être inscrit à notre newsletter. Restez à l'écoute pour des mises à jour passionnantes !\n\nCordialement,\nL'équipe Max`,
      html: `<p>Bonjour,</p><p>Merci de vous être inscrit à notre newsletter. Restez à l'écoute pour des mises à jour passionnantes !</p><p>Cordialement,<br>L'équipe Max</p>`,
    };

    try {
      await sgMail.send(msg);
      console.log("Email envoyé avec succès à :", data.email);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email :", error);
    }
  });