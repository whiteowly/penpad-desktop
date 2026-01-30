import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// import './Login.css';


export default function Login() {
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userType) {
      alert(`You selected: ${userType}`);
      // Here you can navigate or show the next screen
    } else {
      alert('Please select an option.');
    }
  };

  return (

    <div className="login-container">
      <img src='/logo.png' alt='PenpadLogo'></img>
      <h1 className="login-title">Welcome to PenPad💕</h1>

      <div className="button-group">
        <button className="login-button" onClick={() => navigate('/new-user')}>
          New User
        </button>
        <button className="login-button" onClick={() => navigate('/existing-user')}>
          Existing User
        </button>
      </div>
    </div>
  );

}
