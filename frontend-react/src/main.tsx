import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import App from './App';

import AOS from 'aos';
import 'aos/dist/aos.css';

AOS.init();

// Montez l'application React
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}