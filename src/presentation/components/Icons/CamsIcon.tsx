import SvgIcon from "@mui/material/SvgIcon";

export default function CAMSIcon() {
  return (
    <SvgIcon sx={{ height: 21, width: 100, mr: 2 }}>
      <svg
        width={100}
        height={21}
        viewBox="0 0 100 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gear hub – filled dark blue */}
        <circle cx="10" cy="10" r="5.5" fill="#1E3A8A" />

        {/* Barcode inside the gear – symbolises IMS (inventory) */}
        <rect x="7" y="7" width="0.6" height="6" fill="#FFFFFF" />
        <rect x="8" y="6.5" width="0.8" height="7" fill="#FFFFFF" />
        <rect x="9.2" y="7.5" width="0.4" height="5" fill="#FFFFFF" />
        <rect x="10" y="6" width="1.0" height="8" fill="#FFFFFF" />
        <rect x="11.5" y="7.2" width="0.5" height="5.6" fill="#FFFFFF" />
        <rect x="12.5" y="6.8" width="0.7" height="6.4" fill="#FFFFFF" />

        {/* Gear teeth – varying widths & lengths to echo a barcode pattern */}
        <g fill="#1E3A8A">
          <g transform="translate(10,10) rotate(0)">
            <rect x="5.5" y="-0.6" width="2.5" height="1.2" />
          </g>
          <g transform="translate(10,10) rotate(30)">
            <rect x="5.5" y="-1" width="3" height="2" />
          </g>
          <g transform="translate(10,10) rotate(60)">
            <rect x="5.5" y="-0.4" width="2" height="0.8" />
          </g>
          <g transform="translate(10,10) rotate(90)">
            <rect x="5.5" y="-0.75" width="3.5" height="1.5" />
          </g>
          <g transform="translate(10,10) rotate(120)">
            <rect x="5.5" y="-1.1" width="2.5" height="2.2" />
          </g>
          <g transform="translate(10,10) rotate(150)">
            <rect x="5.5" y="-0.5" width="3.2" height="1" />
          </g>
          <g transform="translate(10,10) rotate(180)">
            <rect x="5.5" y="-0.9" width="2.8" height="1.8" />
          </g>
          <g transform="translate(10,10) rotate(210)">
            <rect x="5.5" y="-0.45" width="3" height="0.9" />
          </g>
          <g transform="translate(10,10) rotate(240)">
            <rect x="5.5" y="-0.65" width="2.3" height="1.3" />
          </g>
          <g transform="translate(10,10) rotate(270)">
            <rect x="5.5" y="-1.25" width="3.5" height="2.5" />
          </g>
          <g transform="translate(10,10) rotate(300)">
            <rect x="5.5" y="-0.35" width="2" height="0.7" />
          </g>
          <g transform="translate(10,10) rotate(330)">
            <rect x="5.5" y="-0.8" width="2.8" height="1.6" />
          </g>
        </g>

        {/* Green accent bar – suggests an asset tag / checked status */}
        <rect x="20" y="4" width="2" height="12" rx="1" fill="#10B981" />

        {/* Wordmark – monospace font for a tech-forward look */}
        <text
          x="24"
          y="14"
          fontFamily="'Courier New', Courier, monospace"
          fontWeight="800"
          fontSize="12"
          letterSpacing="1"
          fill="#1E3A8A"
        >
          CAMS
        </text>
      </svg>
    </SvgIcon>
  );
}
