import type { SVGProps } from "react";

/** Small original SVG details for the Student scrapbook UI, not image assets. */
type AccentProps = SVGProps<SVGSVGElement>;

export function MaiBlossomAccent(props: AccentProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      width="64"
      height="64"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <g stroke="#B8893C" strokeWidth="1.3" strokeLinejoin="round">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={angle}
            cx="32"
            cy="18"
            rx="8.3"
            ry="13.5"
            transform={"rotate(" + angle + " 32 32)"}
            fill={angle % 144 === 0 ? "#F8D16A" : "#F1BF4B"}
          />
        ))}
      </g>
      <circle cx="32" cy="32" r="7.2" fill="#9A6334" />
      <g fill="#FBE69A">
        <circle cx="29.5" cy="30" r="1.1" />
        <circle cx="34" cy="29.5" r="1.2" />
        <circle cx="35" cy="34" r="1.15" />
        <circle cx="29" cy="35" r=".9" />
        <circle cx="32" cy="32" r="1" />
      </g>
    </svg>
  );
}

export function MaiBranchAccent(props: AccentProps) {
  return (
    <svg
      viewBox="0 0 166 116"
      width="166"
      height="116"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <g stroke="#846747" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M154 110 C117 89 103 69 73 53 C48 40 28 24 16 9" />
        <path d="M110 79 C105 59 119 39 132 26" />
        <path d="M82 58 C67 58 48 65 30 76" />
        <path d="M52 40 C49 23 56 13 70 6" />
      </g>
      <g stroke="#54784C" strokeWidth="1.4" strokeLinejoin="round">
        <path d="M72 53 C72 27 85 17 99 17 C99 33 88 44 72 53 Z" fill="#84A776" />
        <path d="M86 63 C106 47 120 50 127 57 C113 68 101 71 86 63 Z" fill="#A8BF87" />
        <path d="M51 40 C33 43 23 35 19 22 C35 19 48 24 51 40 Z" fill="#9BB982" />
        <path d="M32 76 C16 68 9 58 10 48 C27 50 37 60 32 76 Z" fill="#7F9E70" />
        <path d="M125 39 C130 24 143 17 156 21 C152 36 142 45 125 39 Z" fill="#A9BE8C" />
      </g>
      <g fill="none" stroke="#DBA94A" strokeWidth="1">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={"a" + angle} cx="28" cy="7" rx="3.8" ry="6.3" transform={"rotate(" + angle + " 28 17)"} fill="#F7D265" />
        ))}
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={"b" + angle} cx="137" cy="9" rx="3.7" ry="6" transform={"rotate(" + angle + " 137 19)"} fill="#F1C458" />
        ))}
      </g>
      <circle cx="28" cy="17" r="3.3" fill="#9B6A37" />
      <circle cx="137" cy="19" r="3.3" fill="#9B6A37" />
      <path d="M115 99 C117 91 125 87 133 87 C132 96 125 102 115 99 Z" fill="#8DAC78" stroke="#54784C" strokeWidth="1.4" />
    </svg>
  );
}
