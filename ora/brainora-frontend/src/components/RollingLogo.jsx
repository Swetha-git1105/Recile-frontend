import wordmark from '../assets/wordmark.png';

// How many copies of the logo are stacked in the strip. The strip slides up past all of them,
// and the last copy looks exactly like the first, so the loop restarts without a visible jump.
// More copies = the roll looks faster, fewer copies = it looks calmer.
const COPIES = 4;

// Sits on top of the monitor screen in the hero picture and plays the rolling-counter animation.
// The position, timing and blur are set in HomePage.css (.rolling-logo and @keyframes logo-roll).
function RollingLogo() {
  const endPosition = -((COPIES - 1) / COPIES) * 100;   // how far the strip slides up (in % of its own height)

  return (
    <div className="rolling-logo" aria-hidden="true">
      <div
        className="reel-strip"
        style={{ height: `${COPIES * 100}%`, '--end': `${endPosition}%` }}
      >
        {Array.from({ length: COPIES }, (_, k) => (
          <img
            key={k}
            className="reel-glyph"
            src={wordmark}
            alt=""
            draggable="false"
            style={{ height: `${100 / COPIES}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default RollingLogo;