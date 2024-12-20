<template>
    <footer class="footer">
   
   <!-- Footer content -->
   <div class="footer-content">
     <!-- Colonne : À propos -->
     <div class="footer-column">
       <h4>À propos de Max</h4>
       <p>Votre assistant IA personnel pour une meilleure santé mentale</p>
       <div class="social-links">
         <a href="#"><img src="../assets/instagram.png" alt="Instagram" class="social-icon"></a>
            <a href="#"><img src="../assets/twitter.png" alt="Twitter" class="social-icon"></a>
       
            <a href="#"><img src="../assets/tik-tok.png" alt="Tiktok" class="social-icon"></a>

       </div>
     </div>

     <!-- Colonne : Liens utiles -->
     <div class="footer-column">
       <h4>Liens utiles</h4>
       <p><a href="#">Conditions d'utilisation</a></p>
       <p><a href="#">Politique de confidentialité</a></p>
       <p><a href="#">FAQ</a></p>
       <p><a href="#">Blog</a></p>
     </div>

     <!-- Colonne : Contact -->
     <div class="footer-column">
       <h4>Contact Support</h4>
       <p><a href="mailto:Max@outlook.com">Max@outlook.com</a></p>
       
     </div>

     <!-- Colonne : Téléchargement -->
     <div class="footer-column">
       <h4>Disponible sur :</h4>
       <button>
         <img src="../assets/applestore-removebg-preview.png" alt="Logo Apple Store" class="store-logo">
         Apple Store
       </button>
       <button>
         <img src="../assets/playstore-removebg-preview.png" alt="Logo Google Play" class="store-logo">
         Google Play
       </button>
     </div>
   </div>

   <!-- Copyright -->
   <div class="footer-bottom">
     <p>&copy; 2024 Max IA. Tous droits réservés.</p>
   </div>
 </footer>
  </template>
  
  <style>
  /* Footer global styles */
  .footer {
    background-color: #1D1D1B;
    color: #fff;
    font-family: Arial, sans-serif;
    padding: 40px 10% 20px; /* Réduit de 80px à 40px */
    overflow: hidden;
    position: relative;
  }
  
  .footer h4 {
    font-size: 18px;
    margin-bottom: 15px;
    color: #fff ;
  }
  
  .footer p {
    font-size: 14px;
    margin: 5px 0;
    line-height: 1.6;
  }
  
  .footer a {
    color: #fff;
    text-decoration: none;
    transition: color 0.3s ease;
  }
  
  .footer a:hover {
    color: #90DBF5;
    text-decoration: none;
  }
  
  /* Newsletter overlay styles */
  .newsletter-overlay {
    position: absolute;
    left: 50%;
    top: 40px;
    transform: translateX(-50%);
    padding: 30px;
    width: 80%;
    border-radius: 10px;
    background-color: #1a1a1a;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    text-align: center;
  }
  
  .newsletter-overlay h4 {
    font-size: 22px;
    margin-bottom: 10px;
  }
  
  .newsletter-overlay p {
    margin-bottom: 20px;
    color: #ccc;
  }
  
  .newsletter-form {
    display: flex;
    justify-content: center;
    gap: 10px;
    max-width: 500px;
    margin: 0 auto;
  }
  
  .newsletter-form input {
    flex: 1;
    padding: 12px;
    border: 1px solid #333;
    border-radius: 5px;
    font-size: 14px;
    background-color: #222;
    color: #fff;
  }
  
  .newsletter-form button {
    padding: 12px 25px;
    border: none;
    background-color: #90DBF5;
    color: #000;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .newsletter-form button:hover {
    background-color: #7bc8e2;
  }
  
  /* Footer content styles */
  .footer-content {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 40px;
    margin-top: 60px; /* Réduit de 120px à 60px */
  }
  
  .footer-column {
    flex: 1;
    min-width: 200px;
  }
  
  .social-links {
    display: flex;
    gap: 15px;
    margin-top: 20px;
  }
  
  .social-icon {
    width: 24px;
    height: 24px;
    transition: opacity 0.3s ease;
  }
  
  .social-icon:hover {
    opacity: 0.8;
  }
  
  .footer-column button {
    background-color: #222;
    color: #fff;
    padding: 12px 20px;
    margin-bottom: 15px;
    border: 1px solid #333;
    border-radius: 8px;
    width: 100%;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s ease;
  }
  
  .footer-column button:hover {
    background-color: #333;
    border-color: #90DBF5;
  }
  
  .store-logo {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
  
  /* Footer bottom */
  .footer-bottom {
    text-align: center;
    margin-top: 60px;
    padding-top: 20px;
    border-top: 1px solid #333;
  }
  
  .footer-bottom p {
    color: #666;
    font-size: 12px;
  }
  </style>