import { useEffect } from 'react';
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
      localStorage.setItem('token', token);
      
      // Rediriger vers le chat
      navigate('/chatbot');
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
