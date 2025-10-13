import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import des composants (nous les créerons ensuite)
import LandingPage from './components/LandingPage.jsx';
import Chat from './components/Chat.jsx';
import AuthUser from './components/Authentication/AuthUser.jsx';
import SuccessPage from './components/SuccessPage.jsx';
import ConditionsUtilisation from './components/Politics/ConditionsUtilisation.jsx';
import PolitiqueConfidentialites from './components/Politics/PolitiqueConfidentialite.jsx';
import NotFound from './components/NotFound.jsx';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chatbot" element={<Chat />} />
        <Route path="/auth" element={<AuthUser />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/politics/conditions-utilisation" element={<ConditionsUtilisation />} />
        <Route path="/politics/politique-confidentialites" element={<PolitiqueConfidentialites />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;