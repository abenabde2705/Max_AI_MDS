import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import App from './App.jsx';

import AOS from 'aos';
import 'aos/dist/aos.css';

AOS.init();

// Montez l'application React
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);