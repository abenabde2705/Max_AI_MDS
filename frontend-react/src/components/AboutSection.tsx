import React from 'react';
import ChatExample from './ChatExample';

interface AboutSectionProps {
  id?: string;
  className?: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({ id, className }) => {
  // Use the public folder image as background. Spaces and special chars encoded in URL.
  const bgUrl = '/LOGO%20rose%20pale@300x.png';
  return (
    <section id={id} className={`py-20 px-8 ${className || ''}`} >
      <div data-aos="fade-up" data-aos-duration="200" data-aos-delay="100" className="max-w-[1400px] mx-auto" style={{ backgroundImage: `url(${bgUrl})` }}>
       
        
        <div className="text-left max-w-none">
           <h2 className="text-[48px] font-bold text-[#DAE63D] mt-5 mb-4 font-['Ubuntu',sans-serif]">QUI EST MAX ?</h2>
          <p className="w-full max-w-[1134px] h-auto text-2xl font-normal leading-10 text-justify text-white font-['Ubuntu',sans-serif]">Je suis là pour vous écouter, vous soutenir et vous aider à avancer. Grâce à l'intelligence artificielle, je vous propose des conseils adaptés pour gérer le stress, l'anxiété ou les moments difficiles. Vos échanges restent confidentiels et sécurisés. <br /> Je ne remplace pas un professionnel, mais je suis là pour vous accompagner, sans jugement, à chaque étape.</p>
        </div>

          <div className="text-left max-w-none mt-16">
            <h2 className="text-[48px] font-bold text-[#DAE63D] mt-5 mb-4 font-['Ubuntu',sans-serif]">UNE ÉCOUTE SIMPLE,<br />DES RÉPONSES CLAIRES</h2>
             <p className="w-full max-w-[1134px] h-auto text-2xl font-normal leading-10 text-justify text-white font-['Ubuntu',sans-serif]">Je m'adapte à vous, à votre personnalité et à vos besoins.Je retiens ce que vous partagez avec moi et j'évolue à vos côtés. Vous choisissez comment je communique : bienveillant, direct ou neutre, c'est vous qui décidez.  Besoin d'un avis ? Envoyez-moi une photo ou décrivez une <br />situation, je suis là pour vous guider et vous conseiller. </p>
          </div>
      </div>
    </section>
    
  );
};

export default AboutSection;