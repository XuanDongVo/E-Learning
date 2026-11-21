import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { MascotColor, PipoMood, PipoStage, PipoProp } from "./pipo.types";

export type PipoCharacterProps = {
  mood: PipoMood;
  stage?: PipoStage;
  size?: number;
  color?: MascotColor;
  blink?: boolean;
  prop?: PipoProp;
};

/** The original Pipo silhouette: pure visual SVG with no timers or window listeners. */
export function PipoCharacter({
  mood, stage = 2, size = 280, color = "primary", blink = false, prop,
}: PipoCharacterProps) {
  const shut = blink || mood === "sleepy" || mood === "oops";
  const cheerful = mood === "happy" || mood === "cheer" || mood === "celebrate";
  const style = { "--mascot-color": `var(--${color})` } as CSSProperties;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 180 180"
      fill="none"
      style={style}
      className="block h-auto w-full shrink-0"
    >
      <g className={cn(mood === "think" && "origin-[90px_38px] rotate-[8deg]")}>
        <path d="M90 40V20" stroke="var(--foreground)" strokeWidth="2" />
        <path d="M89 27C67 30 62 9 63 8C85 5 92 15 89 27Z" fill="var(--success)" stroke="var(--foreground)" strokeWidth="2" />
        {stage >= 2 && <path d="M92 25C91 5 108 2 120 5C117 21 106 29 92 25Z" fill="var(--success)" stroke="var(--foreground)" strokeWidth="2" />}
        {stage >= 3 && <circle cx="95" cy="9" r="7" fill="var(--pink)" stroke="var(--foreground)" strokeWidth="2" />}
        {stage === 4 && <path d="M64 38L72 26L83 34L97 23L110 34L121 25L126 41" stroke="var(--accent)" strokeWidth="7" />}
      </g>
      <g
        className={cn(mood === "wave" && "origin-[90px_90px] motion-safe:animate-[pipo-wave_0.5s_ease-in-out_3]")}
        stroke="var(--foreground)" strokeWidth="2" fill="var(--mascot-color)"
      >
        <path d="M34 98C4 77 3 112 29 119Z" />
        <path d="M146 96C163 67 179 77 166 108L146 119Z" />
      </g>
      <path d="M56 149L52 163Q67 172 77 160L79 149M105 148L104 162Q119 173 130 162L125 148"
        fill="var(--mascot-color)" stroke="var(--foreground)" strokeWidth="2" />
      <path d="M89 35C112 35 119 41 137 63C167 100 161 142 135 152C112 165 64 165 42 151C15 136 21 100 41 69C58 46 67 35 89 35Z"
        fill="var(--mascot-color)" stroke="var(--foreground)" strokeWidth="2.5" />
      <ellipse cx="90" cy="128" rx="35" ry="24" fill="var(--background)" />
      <g>
        {([63, 117] as const).map((x) => (
          <g key={x}>
            <ellipse cx={x} cy="85" rx="15" ry={shut ? 2 : 18}
              fill="var(--card)" stroke="var(--foreground)" strokeWidth="2" />
            {!shut && (
              <g>
                <ellipse cx={x + 2} cy="87" rx="7" ry="10" fill="var(--foreground)" />
                <circle cx={x + 4} cy="82" r="3" fill="var(--card)" />
              </g>
            )}
          </g>
        ))}
      </g>
      <ellipse cx="46" cy="106" rx="9" ry="5" fill="var(--pink-soft)" />
      <ellipse cx="136" cy="106" rx="9" ry="5" fill="var(--pink-soft)" />
      {mood === "think" ? (
        <circle cx="90" cy="110" r="5" stroke="var(--foreground)" strokeWidth="2" />
      ) : (
        <path d={cheerful ? "M78 105Q90 131 103 105Z" : "M80 106Q90 117 101 106"}
          stroke="var(--foreground)" strokeWidth="2.5"
          fill={cheerful ? "var(--foreground)" : "none"} strokeLinecap="round" />
      )}
      {prop === "book" && (
        <g stroke="var(--foreground)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
          <path d="M51 128Q70 119 91 132L91 162Q70 151 53 161Z" fill="var(--card)" />
          <path d="M91 132Q113 119 135 127L133 161Q111 152 91 162Z" fill="var(--secondary)" />
          <path d="M91 133V161M63 139L81 143M103 142L122 138" fill="none" stroke="var(--learning)" strokeWidth="1.5" />
        </g>
      )}
      {prop === "pencil" && (
        <g transform="rotate(19 147 136)" stroke="var(--foreground)" strokeWidth="2" strokeLinejoin="round">
          <path d="M142 103H152V160H142Z" fill="var(--accent)" />
          <path d="M142 160L147 174L152 160Z" fill="var(--secondary)" />
          <path d="M145 168L147 174L149 168" fill="var(--foreground)" />
          <path d="M142 103H152V110H142Z" fill="var(--destructive)" />
        </g>
      )}
      {prop === "badge" && (
        <g stroke="var(--foreground)" strokeWidth="2" strokeLinejoin="round">
          <path d="M119 138L115 169L127 162L139 169L138 138" fill="var(--learning)" />
          <circle cx="126" cy="139" r="13" fill="var(--accent)" />
          <path d="M126 129L129 136L137 137L131 142L132 150L126 146L120 150L121 142L115 137L123 136Z" fill="var(--card)" strokeWidth="1.2"/>
        </g>
      )}
      {mood === "sleepy" && <text x="142" y="50" fill="var(--muted-foreground)" fontSize="14">zzz</text>}
    </svg>
  );
}
