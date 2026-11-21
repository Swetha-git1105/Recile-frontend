import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, AlertIcon } from '../components/icons';
import logo from '../assets/logo.png';
import '../styles/auth.css';

function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();

  // State = values that, when they change, make React redraw the page.
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // One handler for both inputs: the input's name ("email" / "password") says which field to update.
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();        // stop the browser from reloading the page
    setError('');
    setLoading(true);
    try {
      await login(form);       // AuthContext -> api.js -> POST /api/auth/login
      // No navigate() needed: once login succeeds, "user" is set and the check below redirects to Home.
    } catch (err) {
      setError(err.message);   // e.g. "Invalid email or password"
    } finally {
      setLoading(false);
    }
  }

  // Already logged in? Do not show the login form, go to Home.
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="auth-page">
      <div className="wave top" aria-hidden="true" />
      <div className="wave bottom" aria-hidden="true" />

      <main className="auth-card login">
        <img className="auth-logo" src={logo} alt="Recile" />
        <h1>Welcome Back!</h1>
        <p className="auth-subtitle">Login to continue your journey</p>

        {/* Shown after a successful registration (RegisterPage sends this flag). */}
        {location.state?.registered && (
          <div className="success" role="status">Account created. Please log in.</div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="field">
            <MailIcon />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <LockIcon />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              className="toggle-password"
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
            </button>
          </label>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : <>Login <span className="arrow">→</span></>}
          </button>

          {error && (
            <div className="error" role="alert">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}
        </form>

        <div className="divider">or</div>
        <div className="login-footer">
          <span className="register-text">Create an Account? <Link to="/register">Register</Link></span>
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;