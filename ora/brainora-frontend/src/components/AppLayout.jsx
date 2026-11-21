import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useResources } from '../context/ResourceContext';
import { formatCredits } from '../utils/credits';
import {
  DashboardIcon, UserIcon, LogoutIcon, BellIcon, ChevronDownIcon,ResourcesIcon,UploadIcon,
} from './icons';
import logo from '../assets/logo.png';
import '../styles/AppLayout.css';

// The sidebar links. Add a new page here and it appears in the sidebar automatically.
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', Icon: DashboardIcon, end: true },
 // { to: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { to: '/learn', label: 'Learn', Icon: ResourcesIcon },
  { to: '/upload', label: 'Upload', Icon: UploadIcon },
  { to: '/profile', label: 'Profile', Icon: UserIcon },
];

// Frame shown around every logged-in page. <Outlet /> is where the current page is drawn.
function AppLayout() {
  const { user, logout } = useAuth();
  const { totalCredits } = useResources();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);   // points at the profile area, to detect clicks outside it

  // Close the dropdown when the user clicks anywhere else on the page.
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);   // cleanup when the layout unmounts
  }, []);

  function handleLogout() {
    logout();               // removes the token and clears the user
    navigate('/login');
  }

  const displayName = user.name.trim();
  const firstName = displayName.split(' ')[0];
  const initial = displayName.charAt(0).toUpperCase();

  // Which sidebar item matches the current URL? Used for the label in the top bar.
  const current = NAV_ITEMS.find((item) => (item.end ? pathname === item.to : pathname.startsWith(item.to)));

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="Recile home">
          <img className="brand-logo" src={logo} alt="Recile" />
        </Link>
        <div className="top-divider" aria-hidden="true" />

        {current && (
          <div className="page-label">
            <current.Icon />
            <span>{current.label}</span>
          </div>
        )}

        <div className="top-spacer" />

        <Link
          className="credit-pill"
          to="/profile"
          title="Your total credits"
          aria-label={`Total credits: ${formatCredits(totalCredits)}`}
        >
          <span aria-hidden="true">★</span>
          <strong>{formatCredits(totalCredits)}</strong>
          <span>credits</span>
        </Link>

        <button className="icon-button" type="button" aria-label="Notifications" title="Notifications">
          <BellIcon />
          <span className="notification-dot" />
        </button>

        <div className="profile-wrap" ref={menuRef}>
          <button
            className="profile-button"
            type="button"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="avatar">{initial}</span>
            <span>{firstName}</span>
            <ChevronDownIcon />
          </button>
          <nav className={`profile-menu${menuOpen ? ' open' : ''}`} aria-label="Profile menu">
            <Link to="/profile" onClick={() => setMenuOpen(false)}>My Profile</Link>

            <button type="button" onClick={handleLogout}>Logout</button>
          </nav>
        </div>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <nav className="nav-list" aria-label="Main navigation">
            {NAV_ITEMS.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <Icon />
                {label}
              </NavLink>
            ))}
            <div className="nav-separator" />
            <button className="nav-link" type="button" onClick={handleLogout}>
              <LogoutIcon />
              Logout
            </button>
          </nav>
        </aside>

        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;