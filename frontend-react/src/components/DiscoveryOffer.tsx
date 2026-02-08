import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { testi1 } from '../assets/images';

interface DiscoveryOfferProps {
  id?: string;
  className?: string;
}

const DiscoveryOffer: React.FC<DiscoveryOfferProps> = ({ id, className }) => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <section className="py-16 px-4">
      <div className="max-w-[1290px] mx-auto" data-aos="fade-up" data-aos-duration="500" data-aos-delay="200">
        
        <div className="flex flex-col md:flex-row gap-16 items-center">
       
          <div className="flex-1">
            <h2 className="text-[#DAE63D] text-[48px] font-bold mb-6 leading-[30px] capitalize font-['Ubuntu',sans-serif]">OFFRE DÉCOUVERTE</h2>
            <p className="text-white text-2xl font-normal leading-[33px] flex items-center text-justify my-16">
              Découvrez Max, votre compagnon d'écoute intelligent. Profitez d'un essai gratuit pour explorer ses fonctionnalités : écoute bienveillante, conseils personnalisés et interaction adaptée à votre style. Testez-le dès maintenant pour voir comment il peut vous aider au quotidien.
            </p>
            <div className="flex justify-end">
              <Link to="/chatbot" className="no-underline">
                <button className="px-8 py-4 bg-[#DAE63D] text-[#161A4D] border-none rounded-[54px] text-base cursor-pointer transition-all duration-300 shadow-[0px_4px_4px_rgba(0,0,0,0.25),0px_4px_4px_rgba(0,0,0,0.25)] hover:bg-[#BBC600] font-['Ubuntu',sans-serif]">Découvrir Max</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscoveryOffer;