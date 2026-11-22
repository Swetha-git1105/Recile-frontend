import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useResources } from '../context/ResourceContext';
import { useNotifications } from '../context/NotificationContext';
import { formatCredits } from '../utils/credits';
import {
  DashboardIcon, UserIcon, LogoutIcon, BellIcon, ChevronDownIcon,ResourcesIcon,UploadIcon,
  CreditsIcon, SolveIcon, TrophyIcon,
} from './icons';
import logo from '../assets/logo.png';
import '../styles/AppLayout.css';
import '../styles/AppCards.css';

// The sidebar links. Add a new page here and it appears in the sidebar automatically.
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', Icon: DashboardIcon, end: true },
 // { to: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { to: '/learn', label: 'Learn', Icon: ResourcesIcon },
  { to: '/upload', label: 'Upload', Icon: UploadIcon },
  { to: '/solve', label: 'Solve', Icon: SolveIcon },
  { to: '/leaderboard', label: 'Leaderboard', Icon: TrophyIcon },
    { to: '/credits', label: 'Credits', Icon: CreditsIcon },
  { to: '/profile', label: 'Profile', Icon: UserIcon },
];

// Small icons for the mobile menu button and the drawer's close button.
function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

// Frame shown around every logged-in page. <Outlet /> is where the current page is drawn.
function AppLayout() {
  const { user, logout } = useAuth();
  const { totalCredits } = useResources();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);   // mobile sidebar drawer
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

  // Close the drawer whenever the page changes (a sidebar link was tapped).
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // While the drawer is open: Escape closes it and the page behind it does not scroll.
  useEffect(() => {
    if (!drawerOpen) return undefined;

    function handleKeyDown(e) {
      if (e.key === 'Escape') setDrawerOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

  function handleLogout() {
    setDrawerOpen(false);
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
        {/* Only visible on phones and small tablets: opens the sidebar drawer */}
        <button
          className="menu-button"
          type="button"
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          aria-controls="app-sidebar"
          onClick={() => setDrawerOpen(true)}
        >
          <MenuIcon />
        </button>

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

        <Link
          className="icon-button"
          to="/notifications"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          title="Notifications"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span className="notification-count">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

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

      {/* Dimmed area behind the open drawer: tap it to close the menu */}
      {drawerOpen && (
        <div
          className="drawer-backdrop"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="app-layout">
        <aside
          id="app-sidebar"
          className={`sidebar${drawerOpen ? ' open' : ''}`}
        >
          {/* Only visible inside the mobile drawer */}
          <div className="drawer-head">
            <img className="drawer-logo" src={logo} alt="Recile" />
            <button
              className="drawer-close"
              type="button"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

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