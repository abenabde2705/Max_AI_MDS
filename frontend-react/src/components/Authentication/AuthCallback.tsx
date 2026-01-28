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
      
      // Récupérer les informations de l'utilisateur
      fetch('http://localhost:3000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          console.log('Response status:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('User data received:', data);
          if (data.user) {
            // Stocker les informations utilisateur
            const fullName = `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim();
            console.log('Storing user data:', { fullName, email: data.user.email });
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userName', fullName || data.user.email);
            localStorage.setItem('userId', data.user.id);
          }
          // Rediriger vers le chat après avoir stocké les données
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
