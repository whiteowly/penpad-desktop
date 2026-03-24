import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './SplashScreen.css';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [timerDone, setTimerDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimerDone(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (timerDone && !loading) {
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/new-user');
      }
    }
  }, [timerDone, loading, user, navigate]);

  return (
    <div className="splash-container">
      <h1 className="logo-text">penpad</h1>
      <div className="loader"></div>
    </div>
  );
}
