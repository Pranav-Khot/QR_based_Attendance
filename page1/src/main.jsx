import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // 1. Import karein
import App from './App.jsx';
import './index.css';

// 2. Apni Google Client ID yahan paste karein
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. Poore app ko wrap karein */}
    <GoogleOAuthProvider clientId={'949244434845-s8a2226nm34l19teimong4lqbdbusain.apps.googleusercontent.com'}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);