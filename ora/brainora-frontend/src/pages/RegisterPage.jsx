import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/api';
import { UserIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon, CampusIcon, ChevronDownIcon, AlertIcon } from '../components/icons';
import logo from '../assets/logo.png';
import '../styles/auth.css';

function RegisterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', campus: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // One handler for all four fields: the input's name says which part of "form" to update.
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);                                 // POST /api/auth/register
      navigate('/login', { state: { registered: true } });  // go to Login and show the green message
    } catch (err) {
      setError(err.message);   // e.g. "Email already registered"
    } finally {
      setLoading(false);
    }
  }

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="auth-page">
      <div className="wave top" aria-hidden="true" />
      <div className="wave bottom" aria-hidden="true" />

      <main className="auth-card register">
        <img className="auth-logo" src={logo} alt="Recile" />
        <h1>Create Your Account</h1>
        <p className="auth-subtitle">Join Recile and start your journey</p>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <UserIcon />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

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
              autoComplete="new-password"
              minLength={8}
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

          <label className="field">
            <CampusIcon />
            <select name="campus" value={form.campus} onChange={handleChange} required>
              <option value="" disabled>Campus</option>
              <option value="PSG Institute of Technology and Applied Research">
              PSG Institute of Technology and Applied Research
              </option>
              <option value="Other">Other</option>
            </select>
            <ChevronDownIcon className="chevron" strokeWidth={2.2} />
          </label>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? 'Registering...' : <>Register <span className="arrow">→</span></>}
          </button>

          {error && (
            <div className="error" role="alert">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}
        </form>

        <div className="register-footer">
          <span>Already have an account?</span>
          <Link to="/login">Login</Link>
        </div>
      </main>
    </div>
  );
}

export default RegisterPage;