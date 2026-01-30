import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import './NewUser.css';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function NewUser() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: username
      });
      navigate('/existing-user');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="logo-text">penpad</h1>
      <p className="subtitle">Create an account to get started</p>

      <form onSubmit={handleSubmit}>
        <input name='username' type='text' placeholder='Username' required />
        <input name="email" type="email" placeholder="Email" required />
        
        {/* Password Field */}
        <div className="password-wrapper">
          <input 
            name="password" 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            required 
          />
          <span 
            onClick={() => setShowPassword(!showPassword)} 
            className="icon-inside-input"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* Confirm Password Field */}
        <div className="password-wrapper">
          <input 
            name="confirmPassword" 
            type={showConfirmPassword ? "text" : "password"} 
            placeholder="Confirm Password" 
            required 
          />
          <span 
            onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
            className="icon-inside-input"
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit">Sign Up</button>
      </form>

      <p className="switch-link">
        Already have an account?{" "}
        <span onClick={() => navigate('/existing-user')}>Sign In</span>
      </p>
    </div>
  );
}