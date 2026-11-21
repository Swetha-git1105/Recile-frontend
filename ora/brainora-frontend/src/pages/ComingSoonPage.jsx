import { Link } from 'react-router-dom';
import '../styles/AppLayout.css';

// A temporary page for sections that are not built yet (Dashboard, Profile, ...).
// Replace the route in App.jsx with the real page when it exists.
function ComingSoonPage({ title }) {
  return (
    <div className="coming-soon">
      <h1>{title}</h1>
      <p>This page is not built yet.</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
}

export default ComingSoonPage;