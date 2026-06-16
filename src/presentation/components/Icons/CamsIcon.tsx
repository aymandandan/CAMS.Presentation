import SvgIcon from "@mui/material/SvgIcon";

export default function CAMSIcon() {
  return (
    <SvgIcon sx={{ height: 48, width: 120, mr: 2 }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 160 48"
        width="100%"
        height="100%"
        role="img"
        aria-label="CAMS Logo"
      >
        <defs>
          <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3B82F6" />
            <stop offset="100%" stop-color="#14B8A6" />
          </linearGradient>

          <filter id="iconShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="6"
              flood-color="#3B82F6"
              flood-opacity="0.25"
            />
          </filter>

          <filter id="textShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="2"
              flood-color="#0F172A"
              flood-opacity="0.25"
            />
          </filter>

          <clipPath id="iconClip">
            <rect x="0" y="0" width="44" height="44" rx="12" />
          </clipPath>

          <clipPath id="clipTL">
            <polygon points="0,0 44,0 0,44" />
          </clipPath>
          <clipPath id="clipBR">
            <polygon points="44,0 44,44 0,44" />
          </clipPath>

          <g id="gearMaskShape">
            <circle
              cx="22"
              cy="22"
              r="18"
              pathLength="100"
              fill="none"
              stroke="black"
              stroke-width="4.5"
              stroke-dasharray="6.25 6.25"
              stroke-dashoffset="-28.125"
            />
            <circle
              cx="22"
              cy="22"
              r="14"
              fill="none"
              stroke="black"
              stroke-width="4.5"
            />
            <circle cx="22" cy="22" r="7" fill="black" />
            <path
              d="M 22 6 A 16 16 0 1 0 22 38 L 22 34 A 12 12 0 1 1 22 10 Z"
              fill="black"
            />
          </g>

          <mask id="bottomRightMask">
            <polygon points="44,0 44,44 0,44" fill="white" />
            <use href="#gearMaskShape" />
          </mask>
        </defs>

        <g transform="translate(0, 2)" filter="url(#iconShadow)">
          <g clip-path="url(#iconClip)">
            <polygon
              points="44,0 44,44 0,44"
              fill="url(#brandGrad)"
              mask="url(#bottomRightMask)"
            />

            <g clip-path="url(#clipTL)">
              <circle
                cx="22"
                cy="22"
                r="18"
                pathLength="100"
                fill="none"
                stroke="url(#brandGrad)"
                stroke-width="4.5"
                stroke-dasharray="6.25 6.25"
                stroke-dashoffset="-28.125"
              />
              <circle
                cx="22"
                cy="22"
                r="14"
                fill="none"
                stroke="url(#brandGrad)"
                stroke-width="4.5"
              />
              <circle cx="22" cy="22" r="7" fill="url(#brandGrad)" />
              <path
                d="M 22 6 A 16 16 0 1 0 22 38 L 22 34 A 12 12 0 1 1 22 10 Z"
                fill="url(#brandGrad)"
              />
            </g>
          </g>
        </g>

        <g transform="translate(52, 0)" filter="url(#textShadow)">
          <text
            x="0"
            y="38"
            font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            font-weight="900"
            font-size="28"
            fill="url(#brandGrad)"
            letter-spacing="-0.5"
          >
            CAMS
          </text>
        </g>
      </svg>
    </SvgIcon>
  );
}
