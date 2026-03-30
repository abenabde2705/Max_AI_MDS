import { useEffect } from 'react';
import { setToken } from '../../utils/token';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('Erreur OAuth:', error);
      navigate('/auth?error=' + error);
      return;
    }

    if (token) {
      // Stocker le token
      setToken(token, true); // OAuth → toujours persistant
      
      // Récupérer les informations de l'utilisateur
      const API_URL = import.meta.env.VITE_API_URL;
      fetch(`${API_URL}/api/auth/profile`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          console.log('Response status:', res.status);
          return res.json();
        })
        .then(data => {
          if (data.user) {
            const fullName = `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim();
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userName', fullName || data.user.email);
            localStorage.setItem('userId', data.user.id);

            // Rediriger vers l'onboarding si pas de date de naissance
            if (!data.user.birthDate) {
              setTimeout(() => navigate('/onboarding'), 100);
              return;
            }
          }
          setTimeout(() => navigate('/chatbot'), 100);
        })
        .catch(error => {
          console.error('Erreur récupération profil:', error);
          // Rediriger quand même vers le chat
          navigate('/chatbot');
        });
    } else {
      navigate('/auth');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#0a0e27'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h2>Authentification en cours...</h2>
        <p>Veuillez patienter</p>
        <div style={{ 
          marginTop: '20px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          margin: '20px auto'
        }} />
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthCallback;
