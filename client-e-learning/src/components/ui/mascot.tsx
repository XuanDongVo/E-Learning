import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const PIPO_LINES = [
  "Small steps count. You've got this!",
  "A little English, a little progress.",
  "Your next adventure is one click away.",
  "I'm rooting for you!",
  "Take your time. Learning isn't a race.",
  "New words, new possibilities!",
  "Mistakes help us learn.",
  "One activity can make a difference.",
  "Ready when you are!",
  "Look how far you've come!",
  "A fresh start is always welcome.",
  "Let's make today a learning day!",
];

export type PipoMood =
  | "idle"
  | "happy"
  | "cheer"
  | "oops"
  | "think"
  | "sleepy"
  | "wave"
  | "celebrate";

export type MascotColor =
  | "primary"
  | "learning"
  | "accent"
  | "success"
  | "teal"
  | "pink"
  | "warm";

type Speech = { text: string; mood: PipoMood };

const PipoContext = createContext({
  speech: { text: "Ready for a little progress?", mood: "wave" } as Speech,
  enabled: true,
  toggle: () => {},
  say: (...args: [string, PipoMood?, number?]) => {
    void args;
  },
});

export const usePipo = () => useContext(PipoContext);

export function PipoProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(
    () =>
      typeof window === "undefined" ||
      window.localStorage.getItem("learnup-mascot") !== "off",
  );
  const [speech, setSpeech] = useState<Speech>({
    text: "Ready for a little progress?",
    mood: "wave",
  });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  const say = useCallback(
    (text: string, mood: PipoMood = "happy", ttlMs = 5000) => {
      clearTimeout(timer.current);
      setSpeech({ text: text.slice(0, 80), mood });
      timer.current = setTimeout(
        () => setSpeech((current) => ({ ...current, mood: "idle" })),
        ttlMs,
      );
    },
    [],
  );

  const toggle = () =>
    setEnabled((current) => {
      localStorage.setItem("learnup-mascot", current ? "off" : "on");
      return !current;
    });

  return (
    <PipoContext.Provider value={{ speech, enabled, toggle, say }}>
      {children}
    </PipoContext.Provider>
  );
}

export function Pipo({
  mood,
  size = 160,
  stage = 2,
  color = "primary",
}: {
  mood?: PipoMood;
  size?: number;
  stage?: 1 | 2 | 3 | 4;
  color?: MascotColor;
}) {
  const { speech, enabled, say } = usePipo();
  const [blink, setBlink] = useState(false);
  const [sleepy, setSleepy] = useState(false);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [squish, setSquish] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pokes = useRef<number[]>([]);

  useEffect(() => {
    if (!enabled) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let idle: ReturnType<typeof setTimeout>;
    let blinkTimer: ReturnType<typeof setTimeout>;
    let closeTimer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      blinkTimer = setTimeout(
        () => {
          setBlink(true);
          closeTimer = setTimeout(() => {
            setBlink(false);
            schedule();
          }, 150);
        },
        3000 + Math.random() * 3000,
      );
    };
    schedule();
    const wake = (event: PointerEvent) => {
      setSleepy((wasSleepy) => {
        if (wasSleepy) say("Welcome back! Ready when you are.", "wave");
        return false;
      });
      clearTimeout(idle);
      idle = setTimeout(() => setSleepy(true), 30000);
      if (!reduced) {
        const box = ref.current?.getBoundingClientRect();
        if (box) {
          setLook({
            x: Math.max(
              -3,
              Math.min(3, (event.clientX - box.x - box.width / 2) / 60),
            ),
            y: Math.max(
              -3,
              Math.min(3, (event.clientY - box.y - box.height / 2) / 60),
            ),
          });
        }
      }
    };
    window.addEventListener("pointermove", wake);
    window.addEventListener("pointerdown", wake);
    idle = setTimeout(() => setSleepy(true), 30000);
    return () => {
      clearTimeout(idle);
      clearTimeout(blinkTimer);
      clearTimeout(closeTimer);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("pointerdown", wake);
    };
  }, [enabled, say]);

  if (!enabled) return null;
  const actualMood = sleepy ? "sleepy" : (mood ?? speech.mood);
  const shut = blink || actualMood === "sleepy" || actualMood === "oops";
  const cheerful = ["happy", "cheer", "celebrate"].includes(actualMood);
  const poke = () => {
    pokes.current = [
      ...pokes.current.filter((time) => Date.now() - time < 2000),
      Date.now(),
    ];
    say(
      pokes.current.length >= 5
        ? "Hehe! That tickles!"
        : (PIPO_LINES[Math.floor(Math.random() * PIPO_LINES.length)] ??
            "You've got this!"),
      "happy",
    );
    setSquish(true);
    setTimeout(() => setSquish(false), 180);
  };
  const mascotStyle = {
    "--mascot-color": `var(--${color})`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      style={mascotStyle}
      className={cn(
        "leading-none transition-transform duration-150",
        squish && "scale-x-[1.06] scale-y-[0.9]",
        (actualMood === "cheer" || actualMood === "celebrate") &&
          "animate-[pipo-bounce_0.4s_ease-in-out_3]",
      )}
    >
      <Button
        variant="ghost"
        className="h-auto w-auto min-h-[44px] min-w-[44px] p-0 bg-transparent hover:bg-transparent"
        aria-label="Say hello to Pipo"
        onClick={poke}
      >
        <svg
          aria-hidden="true"
          width={size}
          height={size}
          viewBox="0 0 180 180"
          fill="none"
          className="h-auto max-w-full"
        >
          <g className={cn(actualMood === "think" && "origin-[90px_38px] rotate-[8deg]")}>
            <path d="M90 40V20" stroke="var(--foreground)" strokeWidth="2" />
            <path
              d="M89 27C67 30 62 9 63 8C85 5 92 15 89 27Z"
              fill="var(--success)"
              stroke="var(--foreground)"
              strokeWidth="2"
            />
            {stage >= 2 && (
              <path
                d="M92 25C91 5 108 2 120 5C117 21 106 29 92 25Z"
                fill="var(--success)"
                stroke="var(--foreground)"
                strokeWidth="2"
              />
            )}
            {stage >= 3 && (
              <circle
                cx="95"
                cy="9"
                r="7"
                fill="var(--pink)"
                stroke="var(--foreground)"
                strokeWidth="2"
              />
            )}
            {stage === 4 && (
              <path
                d="M64 38L72 26L83 34L97 23L110 34L121 25L126 41"
                stroke="var(--accent)"
                strokeWidth="7"
              />
            )}
          </g>
          <g
            className={cn(
              actualMood === "wave" &&
                "origin-[90px_90px] animate-[pipo-wave_0.5s_ease-in-out_3]",
            )}
            stroke="var(--foreground)"
            strokeWidth="2"
            fill="var(--mascot-color)"
          >
            <path d="M34 98C4 77 3 112 29 119Z" />
            <path d="M146 96C163 67 179 77 166 108L146 119Z" />
          </g>
          <path
            d="M56 149L52 163Q67 172 77 160L79 149M105 148L104 162Q119 173 130 162L125 148"
            fill="var(--mascot-color)"
            stroke="var(--foreground)"
            strokeWidth="2"
          />
          <path
            d="M89 35C112 35 119 41 137 63C167 100 161 142 135 152C112 165 64 165 42 151C15 136 21 100 41 69C58 46 67 35 89 35Z"
            fill="var(--mascot-color)"
            stroke="var(--foreground)"
            strokeWidth="2.5"
          />
          <ellipse cx="90" cy="128" rx="35" ry="24" fill="var(--background)" />
          <g>
            {[63, 117].map((x) => (
              <g key={x}>
                <ellipse
                  cx={x}
                  cy="85"
                  rx="15"
                  ry={shut ? 2 : 18}
                  fill="var(--card)"
                  stroke="var(--foreground)"
                  strokeWidth="2"
                />
                {!shut && (
                  <g transform={`translate(${look.x} ${look.y})`}>
                    <ellipse
                      cx={x + 2}
                      cy="87"
                      rx="7"
                      ry="10"
                      fill="var(--foreground)"
                    />
                    <circle cx={x + 4} cy="82" r="3" fill="var(--card)" />
                  </g>
                )}
              </g>
            ))}
          </g>
          <ellipse cx="46" cy="106" rx="9" ry="5" fill="var(--pink-soft)" />
          <ellipse cx="136" cy="106" rx="9" ry="5" fill="var(--pink-soft)" />
          {actualMood === "think" ? (
            <circle
              cx="90"
              cy="110"
              r="5"
              stroke="var(--foreground)"
              strokeWidth="2"
            />
          ) : (
            <path
              d={
                cheerful ? "M78 105Q90 131 103 105Z" : "M80 106Q90 117 101 106"
              }
              stroke="var(--foreground)"
              strokeWidth="2.5"
              fill={cheerful ? "var(--foreground)" : "none"}
              strokeLinecap="round"
            />
          )}
          {actualMood === "sleepy" && (
            <text x="142" y="50" fill="var(--muted-foreground)" fontSize="14">
              zzz
            </text>
          )}
        </svg>
      </Button>
    </div>
  );
}
