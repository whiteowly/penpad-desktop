import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import './ExistingUser.css'; 
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ExistingUser() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard'); 
    } catch (error) {
      alert(error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="auth-container">
      <h1 className="logo-text">penpad</h1>
      <h2>Welcome Back!</h2>
      <form onSubmit={handleLogin} className="auth-form">
        <input name="email" type="email" placeholder="Email" required />
        
        {/* Updated Password Wrapper */}
        <div className="password-wrapper">
          <input 
            name="password" 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            required 
          />
          <span onClick={togglePasswordVisibility} className="icon-inside-input">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit">Log In</button>
      </form>
      <p className="auth-switch">
        New user? <Link to="/new-user">Sign up</Link>
      </p>
    </div>
  );
}