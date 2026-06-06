// A small, refined bow — the site's quiet signature motif.
export default function Bow({ size = 28, className = "", style }) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={(size * 40) / 64}
      viewBox="0 0 64 40"
      fill="none"
      aria-hidden="true"
    >
      {/* left loop */}
      <path
        d="M32 20C12 3 3 7 5 20C3 33 12 37 32 20Z"
        fill="url(#bowGrad)"
        stroke="#b0728a"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* right loop */}
      <path
        d="M32 20C52 3 61 7 59 20C61 33 52 37 32 20Z"
        fill="url(#bowGrad)"
        stroke="#b0728a"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* ribbon tails */}
      <path
        d="M30 21C24 28 20 33 17 38M34 21C40 28 44 33 47 38"
        stroke="#b0728a"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* center knot */}
      <ellipse cx="32" cy="20" rx="6" ry="6.6" fill="#cf9aad" stroke="#b0728a" strokeWidth="1.4" />
      <defs>
        <linearGradient id="bowGrad" x1="0" y1="0" x2="64" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e7c4d0" />
          <stop offset="1" stopColor="#cf9aad" />
        </linearGradient>
      </defs>
    </svg>
  );
}
