import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollToTop from './components/ScrollToTop';

// Import des composants
import LandingPage from './components/LandingPage';
import Chat from './components/Chat';
import AuthUser from './components/Authentication/AuthUser';
import AuthCallback from './components/Authentication/AuthCallback';
import SuccessPage from './components/SuccessPage';
import ConditionsUtilisation from './components/Politics/ConditionsUtilisation';
import PolitiqueConfidentialites from './components/Politics/PolitiqueConfidentialite';
import NotFound from './components/NotFound';
import Dashboard from './components/DashboardSimple';
import Profile from './components/Profile';
import EmotionalJournal from './components/EmotionalJournal';
import Statistics from './components/Statistics';
import Coaches from './components/Coaches';


const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const token = localStorage.getItem('token');
  return token ? element : <Navigate to="/auth" replace />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chatbot" element={<ProtectedRoute element={<Chat />} />} />
        <Route path="/journal" element={<ProtectedRoute element={<EmotionalJournal />} />} />
        <Route path="/statistics" element={<ProtectedRoute element={<Statistics />} />} />
        <Route path="/coaches" element={<ProtectedRoute element={<Coaches />} />} />
        <Route path="/auth" element={<AuthUser />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />

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