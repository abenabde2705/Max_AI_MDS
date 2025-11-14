import React from 'react';
import NavBar from '../layout/NavBar.jsx';
import HeroSection from './HeroSection.jsx';
import AboutSection from './AboutSection.jsx';
import FeatureCards from './FeatureCards.jsx';
import TestimonialsSection from './TestimonialsSection.jsx';
import DiscoveryOffer from './DiscoveryOffer.jsx';
import '../styles/gradients.css';
import Abonnement from './Abonnement.jsx';
import Newsletter from './Newsletter.jsx';
import Footer from '../layout/Footer.jsx';
import Mail from './Mail.jsx';

const LandingPage = () => {
  return (
    <div className="landing-page gradient-bg2">
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