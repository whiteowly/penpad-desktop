import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
// import './NewUser.css';


export default function NewUser() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);

      navigate('/existing-user');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-container">
      <img src='./logo.png' alt="Logo" className="logo" />
      <h2>Welcome!!</h2>
      <p className="subtitle">Create an account to get started</p>

      <form onSubmit={handleSubmit}>
        <input name='username' type='username' placeholder='Username' required />
        <input name="email" type="email" placeholder="Email" />
        <input name="password" type="password" placeholder="Password" required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" required />
        <span onClick={() => navigate('/existing-user')}> <button type="submit">Sign Up</button></span>

      </form>

      <p className="switch-link">
        Already have an account?{" "}
        <span onClick={() => navigate('/existing-user')}>Sign In</span>
      </p>
    </div>
  );
}
