import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import heroImage from '../assets/hero.png';
import RollingLogo from '../components/RollingLogo';
import { BookIcon, BarChartIcon, CalendarCheckIcon } from '../components/icons';
import '../styles/HomePage.css';
import '../styles/HomeCards.css';

// The three quick-access cards. Change the text or links here.
const QUICK_LINKS = [
  { to: '/learn', title: 'Learn', text: 'Access your learning resources', Icon: BookIcon },
  { to: '/tracking', title: 'Track', text: 'Monitor your progress', Icon: BarChartIcon },
  { to: '/updates', title: 'Stay Updated', text: 'Check latest activities', Icon: CalendarCheckIcon },
];

function HomePage() {
  const { user } = useAuth();                  // the logged-in user, from AuthContext
  const firstName = user.name.trim().split(' ')[0];

  return (
    <>
      <section className="welcome" aria-labelledby="welcomeHeading">
        <div className="welcome-copy">
          <p className="eyebrow">Welcome Back,</p>
          <h1 id="welcomeHeading">{firstName}!</h1>
          <p className="welcome-subtitle">Glad to have you back on Recile.</p>
        </div>
        <div className="hero-stage">
          <img
            className="hero-art"
            src={heroImage}
            alt="A desk with a monitor showing the Recile logo, a stack of books, a pen holder and a plant"
          />
          <RollingLogo />   {/* the animated logo on the monitor screen */}
        </div>
      </section>

      <section className="quick-panel" aria-label="Quick access">
        {QUICK_LINKS.map(({ to, title, text, Icon }) => (
          <Link className="quick-card" to={to} key={to}>
            <span className="quick-icon"><Icon /></span>
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}

export default HomePage;