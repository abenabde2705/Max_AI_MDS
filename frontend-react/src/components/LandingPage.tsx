import React from 'react';
import NavBar from '../layout/NavBar';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import FeatureCards from './FeatureCards';
import TestimonialsSection from './TestimonialsSection';
import DiscoveryOffer from './DiscoveryOffer';
import '../styles/gradients.css';
import Abonnement from './Abonnement';
import Newsletter from './Newsletter';
import Footer from '../layout/Footer';
import BackgroundShapes from './BackgroundShapes';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page gradient-bg2" style={{ position: 'relative', overflowX: 'hidden' }}>
      <BackgroundShapes />
      <div>
        <NavBar className="component-margin" />
        <HeroSection id="hero" className="component-margin" />
      </div>
      
      <div className="section-spacer"></div>
      
      <div>
        <AboutSection id="about" className="component-margin" />
        <div className="section-spacer"></div>
        <FeatureCards id="fonc" className="component-margin" />
      </div>
      
      <div className="section-spacer"></div>
      
      <div>
        <TestimonialsSection id="tem" className="component-margin" />
        <DiscoveryOffer id="desc" className="component-margin" />
        <Abonnement className="component-margin" />
        <Newsletter className="component-margin last-component" />
      </div>
      
      
      <div className="footer-container">
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;