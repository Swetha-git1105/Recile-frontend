// Small SVG icons used by the Login, Register and Home pages.
// Each icon is a React component, so you write <MailIcon /> instead of pasting raw <svg> markup.
// {...props} lets the caller add className, width, height, etc.

function Svg({ viewBox = '0 0 24 24', strokeWidth = 2, children, ...props }) {
  return (
    <svg
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const MailIcon = (props) => (
  <Svg {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 7 9-7" />
  </Svg>
);

export const LockIcon = (props) => (
  <Svg {...props}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    <path d="M12 14v3" />
  </Svg>
);

export const EyeIcon = (props) => (
  <Svg {...props}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const EyeOffIcon = (props) => (
  <Svg {...props}>
    <path d="M3 3l18 18" />
    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
    <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.1-2.3 3.1" />
    <path d="M6.2 6.2C4.3 7.4 3 9.3 2.5 12c.7 2.1 3.9 7 9.5 7 1.1 0 2.1-.2 3-.6" />
  </Svg>
);

export const AlertIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v6m0 3h.01" />
  </Svg>
);

export const UserIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
  </Svg>
);

export const CampusIcon = (props) => (
  <Svg {...props}>
    <path d="M3 21h18M4 18h16M5 18V9m4 9V9m6 9V9m4 9V9M3 7l9-4 9 4v2H3z" />
  </Svg>
);

export const ChevronDownIcon = (props) => (
  <Svg {...props}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const HomeIcon = (props) => (
  <Svg {...props}>
    <path d="m3 10 9-7 9 7" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9 21v-7h6v7" />
  </Svg>
);
export const UploadIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 16V4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
);
export const ResourcesIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 7v14" />
    <path d="M3 5.5C6.2 4.5 9.5 5 12 7c2.5-2 5.8-2.5 9-1.5V19c-3.2-1-6.5-.5-9 1.5-2.5-2-5.8-2.5-9-1.5z" />
  </svg>
);
export const DashboardIcon = (props) => (
  <Svg {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </Svg>
);

export const SettingsIcon = (props) => (
  <Svg {...props}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="2.6" />
  </Svg>
);

export const LogoutIcon = (props) => (
  <Svg {...props}>
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
    <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
  </Svg>
);

export const BellIcon = (props) => (
  <Svg {...props}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    <path d="M10 21h4" />
  </Svg>
);

// The three quick-card icons use a 48x48 grid and thicker lines.
export const BookIcon = (props) => (
  <Svg viewBox="0 0 48 48" strokeWidth={3} {...props}>
    <path d="M24 13C18 8 10 9 5 11v27c7-3 14-2 19 3 5-5 12-6 19-3V11c-5-2-13-3-19 2Z" />
    <path d="M24 13v28" />
  </Svg>
);

export const BarChartIcon = (props) => (
  <Svg viewBox="0 0 48 48" strokeWidth={3.5} {...props}>
    <path d="M7 39V25h9v14zM21 39V15h9v24zM35 39V7h9v32z" />
  </Svg>
);

export const CalendarCheckIcon = (props) => (
  <Svg viewBox="0 0 48 48" strokeWidth={3.2} {...props}>
    <rect x="6" y="10" width="36" height="32" rx="4" />
    <path d="M15 5v10M33 5v10M6 20h36" />
    <path d="m17 30 5 5 10-10" />
  </Svg>
);

// Credit System tab: a coin
export const CreditsIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.8 9.2c-.6-.8-1.6-1.2-2.8-1.2-1.7 0-2.8.9-2.8 2.1 0 3 5.8 1.4 5.8 4.4 0 1.2-1.2 2.1-3 2.1-1.3 0-2.4-.5-3-1.4" />
    <path d="M12 6.5V8m0 8v1.5" />
  </Svg>
);

// Time for Solving tab: a speech bubble with a question mark
export const SolveIcon = (props) => (
  <Svg {...props}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2.5 21.5Z" />
    <path d="M9.1 9.2a3 3 0 0 1 5.8 1c0 2-2.9 2.6-2.9 2.6" />
    <path d="M12 16.8h.01" />
  </Svg>
);

// Leaderboard tab: a trophy
export const TrophyIcon = (props) => (
  <Svg {...props}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
    <path d="M8 6H5a1 1 0 0 0-1 1c0 2.5 1.6 4 4 4" />
    <path d="M16 6h3a1 1 0 0 1 1 1c0 2.5-1.6 4-4 4" />
    <path d="M12 13v4" />
    <path d="M8.5 20h7" />
    <path d="M10 17h4v3h-4z" />
  </Svg>
);
