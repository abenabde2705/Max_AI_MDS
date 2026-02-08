import React from 'react';
import NavBar from '../layout/NavBar';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import FeatureCards from './FeatureCards';
import TestimonialsSection from './TestimonialsSection';
import DiscoveryOffer from './DiscoveryOffer';
import Abonnement from './Abonnement';
import Newsletter from './Newsletter';
import Footer from '../layout/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-purple">
      <div>
        <NavBar className="mb-8" />
        <HeroSection id="hero" className="mb-8" />
      </div>
      
      <div className="h-px max-w-[1200px] mx-auto my-12 relative after:content-[''] after:absolute after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent"></div>
      
      <div>
        <AboutSection id="about" className="mb-8" />
        <div className="h-px max-w-[1200px] mx-auto my-12 relative after:content-[''] after:absolute after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent"></div>
        <FeatureCards id="fonc" className="mb-8" />
      </div>
      
      <div className="h-px max-w-[1200px] mx-auto my-12 relative after:content-[''] after:absolute after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent"></div>
      
      <div>
        <TestimonialsSection id="tem" className="mb-8" />
        <DiscoveryOffer id="desc" className="mb-8" />
        <Abonnement className="mb-8" />
        <Newsletter className="mb-8" />
      </div>
      
      
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;