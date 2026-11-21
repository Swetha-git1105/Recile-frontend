import '../styles/DashboardPage.css';

function DashboardArt() {
  return (
    <svg
      className="dashboard-art"
      viewBox="0 0 760 470"
      role="img"
      aria-label="Laptop displaying Recile, books, a coffee mug and a plant"
    >
      <defs>
        <linearGradient id="dash-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f9ffff" />
          <stop offset="1" stopColor="#d9f7f4" />
        </linearGradient>
        <linearGradient id="dash-laptop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#314b5f" />
          <stop offset="1" stopColor="#142c3e" />
        </linearGradient>
        <linearGradient id="dash-book" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38d0c5" />
          <stop offset="1" stopColor="#078e88" />
        </linearGradient>
      </defs>

      {/* Soft background and ground shadow */}
      <circle cx="420" cy="205" r="190" fill="#e4f8f6" />
      <ellipse cx="390" cy="416" rx="355" ry="28" fill="#d9f4f1" />

      {/* Books */}
      <g transform="translate(65 320)">
        <path d="M10 26 Q10 8 30 8 H205 Q222 8 226 24 V56 H30 Q10 56 10 40Z" fill="url(#dash-book)" />
        <path d="M25 18 H207 Q216 18 220 27 L214 40 H27 Q17 40 17 31Z" fill="#50d9cf" />
        <path d="M28 56 H220 V78 Q220 88 206 88 H28 Q10 88 10 74V68Q10 56 28 56Z" fill="#fff" stroke="#b8dadd" strokeWidth="3" />
        <path d="M28 64 H211" stroke="#d8e7e9" strokeWidth="3" />
        <path d="M18 89 H226 V108 Q226 119 209 119 H23 Q5 119 5 103V101Q5 89 18 89Z" fill="#087f7b" />
        <path d="M26 94 H215 V108 H26Z" fill="#f8ffff" />
      </g>

      {/* Coffee mug and steam */}
      <g transform="translate(280 245)">
        <path d="M30 15 Q30 7 42 7 H111 Q124 7 124 19 L116 112 Q114 129 97 129 H57 Q40 129 38 112Z" fill="#fff" stroke="#d7e8e9" strokeWidth="3" />
        <path d="M123 37 Q163 34 159 76 Q155 103 119 96" fill="none" stroke="#d7e8e9" strokeWidth="12" />
        <path d="M123 37 Q154 38 149 72 Q145 88 121 86" fill="none" stroke="#f8ffff" strokeWidth="7" />
        <ellipse cx="77" cy="15" rx="47" ry="7" fill="#d5e9e8" />
        <ellipse cx="77" cy="13" rx="43" ry="5" fill="#087f7b" />
        <path d="M60 -3 Q44 -28 60 -47 M84 -5 Q70 -30 88 -54" fill="none" stroke="#9abfca" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* Plant */}
      <g transform="translate(535 30)">
        <path d="M98 285 Q88 185 45 92 M100 285 Q117 177 164 80 M100 285 Q58 195 12 170 M100 285 Q151 203 211 178" fill="none" stroke="#287f49" strokeWidth="7" strokeLinecap="round" />
        <path d="M45 92 C2 73 4 25 10 8 C52 20 67 58 45 92Z" fill="#58bb70" />
        <path d="M164 80 C161 28 205 3 222 -2 C235 42 207 72 164 80Z" fill="#43a85c" />
        <path d="M12 170 C-29 137 -15 95 -6 81 C37 105 43 146 12 170Z" fill="#68c97a" />
        <path d="M211 178 C231 133 275 134 291 141 C273 181 240 194 211 178Z" fill="#4caf62" />
        <path d="M61 276 H143 L132 378 Q128 394 104 394 H98 Q73 394 70 378Z" fill="#fff" stroke="#d4e6e6" strokeWidth="4" />
        <ellipse cx="102" cy="276" rx="42" ry="10" fill="#dcebed" />
      </g>

      {/* Laptop */}
      <g transform="translate(350 165)">
        <path d="M30 15 Q33 0 50 0 H315 Q334 0 334 19 L315 245 H12Z" fill="url(#dash-laptop)" />
        <path d="M44 17 H319 L301 220 H27Z" fill="url(#dash-screen)" />
        <circle cx="181" cy="9" r="3" fill="#8198a4" />
        <text x="173" y="132" textAnchor="middle" fontSize="43" fontWeight="800" fill="#080b0d" letterSpacing="-2">Recile</text>
        <path d="M12 245 H315 L365 274 Q372 282 348 286 H0 Q-14 281 0 273Z" fill="#526b7c" />
        <path d="M128 251 H220 L235 267 H112Z" fill="#91a6b1" />
      </g>
    </svg>
  );
}

function DashboardPage() {
  return (
    <section className="dashboard-welcome" aria-labelledby="dashboard-heading">
      <div className="dashboard-copy">
        <p className="dashboard-eyebrow">A little reminder for today</p>
        <h1 id="dashboard-heading">
          HAVE A NICE DAY
          <span>DUDE!</span>
        </h1>
        <div className="dashboard-underline" aria-hidden="true">
          <span />
          <span />
        </div>
      </div>

      <div className="dashboard-illustration">
        <DashboardArt />
      </div>
    </section>
  );
}

export default DashboardPage;
