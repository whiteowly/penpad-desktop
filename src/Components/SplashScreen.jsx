import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashScreen.css';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('SplashScreen mounted');
    const timer = setTimeout(() => {
      console.log('Navigating to /login');
      navigate('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">
      <img src="logo.png" alt="PenPad Logo" className="logo" />
      <div className="loader"></div>
    </div>
  );
}
