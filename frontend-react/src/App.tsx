import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';

// Import des composants
import LandingPage from './components/LandingPage';
import Chat from './components/Chat';
import AuthUser from './components/Authentication/AuthUser';
import SuccessPage from './components/SuccessPage';
import ConditionsUtilisation from './components/Politics/ConditionsUtilisation';
import PolitiqueConfidentialites from './components/Politics/PolitiqueConfidentialite';
import NotFound from './components/NotFound';
import Dashboard from './components/DashboardSimple';


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chatbot" element={<Chat />} />
        <Route path="/auth" element={<AuthUser />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/success" element={<SuccessPage />} />
        <Route path="/politics/conditions-utilisation" element={<ConditionsUtilisation />} />
        <Route path="/politics/politique-confidentialites" element={<PolitiqueConfidentialites />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ScrollToTop />
    </BrowserRouter>
  );
};

export default App;