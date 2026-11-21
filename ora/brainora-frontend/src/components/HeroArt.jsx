// The illustration on the Home page (books, plant and laptop), converted to a React component.
// It is plain SVG drawing instructions, so it needs no image file.
// Note: HTML attributes like stop-color become camelCase in JSX (stopColor), and class becomes className.

function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 600 340" role="img" aria-label="Books, a plant and a laptop displaying the Recile logo">
      <defs>
        <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f9ffff"/><stop offset="1" stopColor="#dff9f6"/></linearGradient>
        <linearGradient id="bookTop" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#32cabe"/><stop offset="1" stopColor="#079c96"/></linearGradient>
        <linearGradient id="laptop" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#31495c"/><stop offset="1" stopColor="#152b3d"/></linearGradient>
      </defs>
      <ellipse cx="300" cy="300" rx="275" ry="22" fill="#d9f4f1"/>
      <circle cx="390" cy="158" r="145" fill="#e5f8f7"/>
      {/* books */}
      <g transform="translate(45 188)">
        <path d="M10 34 Q10 15 32 15 H230 Q245 15 250 31 V62 H32 Q10 62 10 45Z" fill="url(#bookTop)"/>
        <path d="M26 25 H231 Q238 25 242 33 L236 47 H28 Q19 47 19 38Z" fill="#45d5ca"/>
        <path d="M30 62 H242 V83 Q242 91 230 91 H29 Q12 91 12 78V73Q12 62 30 62Z" fill="#fdfefe" stroke="#b9d9dc" strokeWidth="2"/>
        <path d="M30 69 H234" stroke="#d7e6e8" strokeWidth="3"/>
        <path d="M20 92 H247 V110 Q247 120 231 120 H25 Q8 120 8 105V103Q8 92 20 92Z" fill="#087f7b"/>
        <path d="M29 96 H235 V109 H29Z" fill="#f8ffff"/>
        <path d="M18 34 V52 M18 96 V111" stroke="#087d79" strokeWidth="5"/>
      </g>
      {/* plant */}
      <g transform="translate(292 40)">
        <path d="M77 182 Q73 115 41 63" fill="none" stroke="#277f48" strokeWidth="5"/>
        <path d="M78 178 Q83 105 113 55" fill="none" stroke="#277f48" strokeWidth="5"/>
        <path d="M75 177 Q49 116 12 105" fill="none" stroke="#277f48" strokeWidth="5"/>
        <path d="M78 151 Q111 106 139 112" fill="none" stroke="#277f48" strokeWidth="5"/>
        <path d="M41 63 C-1 45 2 10 4 4 C39 11 53 34 41 63Z" fill="#57b86d"/>
        <path d="M113 55 C111 12 143 -3 151 -8 C164 27 145 49 113 55Z" fill="#42a95c"/>
        <path d="M12 105 C-22 79 -13 49 -8 40 C24 57 34 83 12 105Z" fill="#67c979"/>
        <path d="M139 112 C154 76 184 78 194 81 C182 113 160 124 139 112Z" fill="#4caf62"/>
        <path d="M48 174 H111 L103 239 Q100 250 80 250 H75 Q57 250 54 239Z" fill="#fff" stroke="#d4e6e6" strokeWidth="3"/>
        <ellipse cx="79" cy="174" rx="32" ry="8" fill="#dcebed"/>
      </g>
      {/* laptop */}
      <g transform="translate(360 104)">
        <path d="M26 12 Q28 2 40 2 H225 Q239 2 239 15 L226 177 H13Z" fill="url(#laptop)"/>
        <path d="M35 15 H226 L214 163 H24Z" fill="url(#screen)"/>
        <circle cx="132" cy="8" r="2" fill="#8296a2"/>
        <text x="125" y="94" textAnchor="middle" fontSize="35" fontWeight="800" fill="#080b0d" letterSpacing="-2">Recile</text>
        <path d="M13 177 H226 L258 194 Q263 199 248 202 H0 Q-10 199 0 193Z" fill="#526b7c"/>
        <path d="M87 181 H154 L163 191 H78Z" fill="#91a6b1"/>
      </g>
    </svg>
  );
}

export default HeroArt;