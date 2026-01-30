import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
// import './ExistingUser.css'; // Shared styles


export default function ExistingUser() {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);

      navigate('/dashboard'); // Redirect to dashboard after login
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-container">
      <img src='./logo.png' alt="Logo" className="auth-logo" />
      <h2>Welcome Back!</h2>
      <form onSubmit={handleLogin} className="auth-form">
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">Log In</button>
      </form>
      <p className="auth-switch">
        New user? <Link to="/new-user">Sign up</Link>
      </p>
    </div>
  );
}
