"use client";

import { useId, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import "./memory-mai-tree.css";

export const MEMORY_MAI_STAGES = [0, 3, 7, 14, 30] as const;
export type MemoryMaiStage = (typeof MEMORY_MAI_STAGES)[number];

type LeafPoint = readonly [x: number, y: number, size?: number];
type FlowerPoint = readonly [x: number, y: number, size?: number];

const SAPLING_LEAVES: LeafPoint[] = [
  [275, 285], [250, 305], [310, 292], [229, 327], [330, 317],
  [284, 249], [299, 268], [260, 258],
];
const YOUNG_LEAVES: LeafPoint[] = [
  [211, 233, 1.1], [244, 204], [284, 186], [323, 199], [358, 228],
  [184, 261], [222, 271], [260, 239], [310, 239], [376, 266],
  [197, 303], [346, 300], [288, 160], [159, 279, .78], [393, 283, .82],
];
const ANCIENT_LEAVES: LeafPoint[] = [
  [98, 235, .9], [130, 202], [168, 181], [198, 155], [240, 142],
  [289, 135], [330, 149], [368, 165], [405, 190], [443, 220, .86],
  [118, 270], [153, 244], [192, 221], [236, 208], [278, 196],
  [321, 214], [366, 238], [410, 260], [462, 267, .85],
  [164, 287], [203, 264], [250, 253], [292, 264], [331, 286],
  [384, 299], [126, 307, .9], [442, 309, .85], [263, 169],
  [350, 190], [215, 313, .88], [311, 324, .88],
];

const ANCIENT_FLOWERS: FlowerPoint[] = [
  [102, 218, .83], [132, 189, .9], [170, 169], [201, 147, .9],
  [238, 136, .8], [282, 132, .9], [323, 144, .85], [366, 158],
  [410, 185, .92], [443, 222, .86], [114, 269, .85], [159, 242],
  [193, 212, .87], [229, 196], [269, 186, .86], [306, 203],
  [346, 224, .91], [388, 247], [430, 268, .9], [166, 281, .86],
  [211, 260], [254, 247, .94], [294, 255], [333, 277, .91],
  [375, 294, .86], [128, 304, .85], [449, 307, .86], [245, 167],
  [348, 183, .9], [213, 311, .8], [306, 312, .86], [178, 194, .76],
  [390, 212, .75], [282, 225, .72],
];

const STAGE_NAMES: Record<MemoryMaiStage, string> = {
  0: "Hạt mai chờ nảy mầm",
  3: "Mầm mai đầu tiên",
  7: "Cây mai non",
  14: "Cây mai trưởng thành, bắt đầu kết nụ",
  30: "Cây mai cổ thụ nở hoa vàng",
};

function Soil() {
  return (
    <g aria-hidden="true">
      <ellipse cx="280" cy="446" rx="175" ry="18" fill="#D4BF91" opacity=".24" />
      <path d="M103 436 Q180 430 243 436 T458 436" fill="none" stroke="#A08A63" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M140 440 Q222 456 302 443 T424 444" fill="none" stroke="#C1A77A" strokeWidth="3" strokeLinecap="round" opacity=".66" />
      <g fill="#B49B70">
        <circle cx="147" cy="445" r="2.4" /><circle cx="183" cy="453" r="1.6" />
        <circle cx="404" cy="443" r="2.7" /><circle cx="371" cy="454" r="1.6" />
        <circle cx="326" cy="458" r="1.9" /><circle cx="221" cy="457" r="1.6" />
      </g>
      <path d="M119 437 l-4 -9 m4 9 l6 -7 M425 438 l-2 -11 m2 11 l5 -7" stroke="#87966A" strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>
  );
}

function MaiSeed({ animated }: { animated: boolean }) {
  return (
    <g>
      <path d="M251 438 Q278 427 309 438 L306 446 Q277 455 253 446 Z" fill="#9F7C57" opacity=".24" />
      <motion.g
        initial={animated ? { y: 8, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: .7, ease: "easeOut" }}
      >
        <path d="M265 423 C258 409 274 394 289 406 C300 415 291 430 278 432 C272 431 268 428 265 423 Z" fill="#B98B55" stroke="#72513A" strokeWidth="3" />
        <path d="M273 405 Q285 413 279 428" fill="none" stroke="#E9BC80" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M276 407 l6 10 -4 7" fill="none" stroke="#785236" strokeWidth="1.6" strokeLinecap="round" />
      </motion.g>
    </g>
  );
}

function MaiSprout({ animated }: { animated: boolean }) {
  return (
    <g>
      <motion.path
        d="M280 437 Q273 411 282 383 Q290 365 278 344"
        fill="none"
        stroke="#557F53"
        strokeWidth="6"
        strokeLinecap="round"
        initial={animated ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <motion.g initial={animated ? { opacity: 0, scale: .25 } : false} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .5, type: "spring", stiffness: 140, damping: 15 }} style={{ transformOrigin: "281px 359px" }}>
        <path d="M282 365 C255 365 241 346 247 327 C266 328 280 339 282 365 Z" fill="#8CB66B" stroke="#587E50" strokeWidth="2.1" />
        <path d="M281 363 C303 341 324 339 329 321 C307 319 287 330 281 363 Z" fill="#A4C67F" stroke="#587E50" strokeWidth="2.1" />
        <path d="M280 361 L255 338 M283 359 L316 330" stroke="#628A54" strokeWidth="1.6" strokeLinecap="round" />
      </motion.g>
      <ellipse cx="279" cy="438" rx="12" ry="4.2" fill="#806548" opacity=".55" />
    </g>
  );
}

function LeafCluster({ x, y, size = 1, index, animated }: {
  x: number; y: number; size?: number; index: number; animated: boolean;
}) {
  const twist = (index % 5 - 2) * 9;
  const fill = index % 3 === 0 ? "#97AE73" : index % 3 === 1 ? "#71966A" : "#AEC184";
  return (
    <g transform={"translate(" + x + " " + y + ") scale(" + size + ") rotate(" + twist + ")"}>
      <motion.g
        initial={animated ? { opacity: 0, scale: .38, rotate: -9 } : false}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: .25 + index * .023, duration: .5, ease: "easeOut" }}
      >
        <path d="M0 5 C-20 5 -25 -13 -25 -18 C-7 -19 1 -11 0 5 Z" fill={fill} stroke="#53734D" strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M0 4 C7 -20 20 -23 28 -20 C25 -3 16 5 0 4 Z" fill={index % 2 ? "#B1C88A" : "#8FB171"} stroke="#587A53" strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M1 4 C1 -13 5 -23 10 -29 C21 -18 14 -4 1 4 Z" fill="#71966B" stroke="#53734D" strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M0 5 L-18 -12 M0 4 L20 -14 M1 4 L9 -21" stroke="#D5DDB1" strokeWidth="1" opacity=".8" />
      </motion.g>
    </g>
  );
}

function MaiFlower({ x, y, size = 1, index, animated }: {
  x: number; y: number; size?: number; index: number; animated: boolean;
}) {
  const gold = index % 3 === 0 ? "#FFDB65" : index % 3 === 1 ? "#F6C948" : "#F9D75F";
  return (
    <g transform={"translate(" + x + " " + y + ") scale(" + size + ")"}>
      <motion.g
        initial={animated ? { opacity: 0, scale: .08, rotate: -25 } : false}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: .45 + index * .039, duration: .6, type: "spring", stiffness: 175, damping: 16 }}
      >
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx="0" cy="-10.5" rx="7.2" ry="11.4" transform={"rotate(" + angle + ")"} fill={gold} stroke="#D8A33F" strokeWidth="1.2" />
        ))}
        <circle r="5.4" fill="#B77936" />
        <circle cx="-1.6" cy="-1.1" r="1.05" fill="#FFE69C" />
        <circle cx="1.9" cy=".6" r="1.05" fill="#FFE69C" />
        <circle cx=".4" cy="2.3" r=".9" fill="#FFE69C" />
      </motion.g>
    </g>
  );
}

const SAPLING_BRANCHES = [
  "M280 370 C270 350 254 334 236 321",
  "M282 346 C295 328 315 316 333 310",
  "M279 315 C270 292 270 276 279 258",
];
const YOUNG_BRANCHES = [
  "M279 350 C257 313 232 278 195 263",
  "M270 314 C267 281 249 240 231 216",
  "M282 311 C306 275 329 246 356 236",
  "M285 287 C283 247 287 204 289 170",
  "M243 284 C221 282 195 282 164 285",
  "M322 260 C347 263 377 268 395 286",
];
const ANCIENT_BRANCHES = [
  "M270 318 C234 289 209 256 170 231 C139 215 114 223 94 231",
  "M269 302 C260 261 248 212 222 178 C205 151 176 152 153 167",
  "M275 291 C280 237 275 187 284 142",
  "M286 304 C311 263 346 223 389 207 C418 196 435 207 451 225",
  "M282 340 C308 302 342 286 382 288 C415 289 429 299 453 311",
  "M244 285 C216 251 184 225 147 202",
  "M254 258 C254 212 235 185 203 153",
  "M296 270 C324 234 341 202 363 165",
  "M332 241 C365 231 390 240 422 255",
  "M219 271 C189 276 161 291 126 308",
];

function MaiTrunk({ stage }: { stage: 7 | 14 | 30 }) {
  if (stage === 7) {
    return (
      <g strokeLinejoin="round">
        <path d="M272 438 C272 414 277 388 276 354 C275 328 273 294 277 262 C285 290 286 328 285 355 C284 392 291 416 291 438 Z" fill="#976E51" stroke="#684D3C" strokeWidth="3" />
        <path d="M280 428 Q281 372 279 311" fill="none" stroke="#C69B72" strokeWidth="3" opacity=".8" strokeLinecap="round" />
      </g>
    );
  }
  if (stage === 14) {
    return (
      <g strokeLinejoin="round">
        <path d="M258 439 C264 409 268 388 266 363 C264 339 270 316 274 283 C279 253 276 216 284 178 C297 223 290 268 288 295 C285 337 284 375 302 439 L287 433 L275 411 L269 438 Z" fill="#94694D" stroke="#624735" strokeWidth="3.5" />
        <path d="M270 423 C274 387 271 353 280 311 C286 272 287 238 284 205" fill="none" stroke="#BD906C" strokeWidth="5" opacity=".8" strokeLinecap="round" />
        <path d="M279 375 Q276 358 281 344 M282 325 l4 -16 M278 291 l-2 -13" stroke="#624735" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".75" />
      </g>
    );
  }
  return (
    <g strokeLinejoin="round">
      <path d="M227 442 C248 424 255 395 251 366 C248 344 258 323 276 305 C295 286 290 265 282 245 C275 223 253 207 249 178 C273 192 296 215 308 241 C324 275 311 297 300 320 C288 346 289 367 301 397 C310 417 326 429 347 441 L315 438 C293 434 277 425 270 411 C265 427 256 438 247 441 Z" fill="#8B6449" stroke="#634936" strokeWidth="4" />
      <path d="M262 378 C258 346 271 323 289 296 C306 270 296 239 278 211" fill="none" stroke="#BC8F65" strokeWidth="11" opacity=".69" strokeLinecap="round" />
      <path d="M282 411 C269 384 275 354 284 329 M289 289 C306 265 297 242 288 229 M269 365 C268 342 281 319 292 310" fill="none" stroke="#553F35" strokeWidth="3.1" strokeLinecap="round" opacity=".68" />
      <path d="M255 420 C238 434 213 442 189 442 C217 430 228 416 242 399 M271 421 C263 441 240 451 221 453 M299 414 C315 433 343 441 373 443 C344 424 326 405 308 386" fill="#8B6449" stroke="#634936" strokeWidth="4.1" strokeLinecap="round" />
      <path d="M240 429 Q230 433 220 435 M313 427 Q328 434 343 438" fill="none" stroke="#BC8F65" strokeWidth="3" strokeLinecap="round" opacity=".7" />
      <path d="M253 348 l8 -11 -3 19 M278 386 l-6 -13 M293 357 l8 -19 M267 317 l8 -10" fill="none" stroke="#5E4336" strokeWidth="2" opacity=".72" strokeLinecap="round" />
    </g>
  );
}

function WoodyTree({ stage, animated }: { stage: 7 | 14 | 30; animated: boolean }) {
  const branches = stage === 7 ? SAPLING_BRANCHES : stage === 14 ? YOUNG_BRANCHES : ANCIENT_BRANCHES;
  const leaves = stage === 7 ? SAPLING_LEAVES : stage === 14 ? YOUNG_LEAVES : ANCIENT_LEAVES;
  const thick = stage === 7 ? 5 : stage === 14 ? 8 : 11;
  return (
    <g>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {branches.map((d, index) => (
          <motion.path
            key={d}
            d={d}
            stroke={index % 3 === 0 ? "#6C513C" : "#886349"}
            strokeWidth={Math.max(3.6, thick - index % 3 * 1.8)}
            initial={animated ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: .65 + index * .08, delay: .15, ease: "easeOut" }}
          />
        ))}
      </g>
      <MaiTrunk stage={stage} />
      <g>
        {leaves.map(([x, y, size], index) => (
          <LeafCluster key={index} x={x} y={y} size={size} index={index} animated={animated} />
        ))}
      </g>
      {stage === 14 && (
        <g fill="#DDAF4E" stroke="#997B3E" strokeWidth="1.5">
          {[[207, 211], [277, 162], [328, 219], [380, 274], [231, 263], [177, 277], [347, 285]].map(([x, y], index) => (
            <motion.ellipse
              key={index} cx={x} cy={y} rx="5" ry="8"
              initial={animated ? { opacity: 0, scale: .2 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: .6 + index * .08, duration: .5 }}
            />
          ))}
        </g>
      )}
      {stage === 30 && (
        <g>
          {ANCIENT_FLOWERS.map(([x, y, size], index) => (
            <MaiFlower key={index} x={x} y={y} size={size} index={index} animated={animated} />
          ))}
        </g>
      )}
    </g>
  );
}

const PETAL_POSITIONS: Array<readonly [number, number]> = [
  [122, 206], [171, 161], [216, 184], [261, 136], [322, 151], [373, 175],
  [420, 222], [151, 258], [225, 248], [291, 228], [347, 260], [401, 278],
];

function FallingPetals({ burst, idle }: { burst: number; idle: boolean }) {
  return (
    <g aria-hidden="true">
      {idle && PETAL_POSITIONS.slice(0, 5).map(([x, y], index) => (
        <g key={"idle-" + index} transform={"translate(" + x + " " + y + ")"}>
          <g
            className="memory-mai-falling-petal memory-mai-falling-petal--idle"
            style={{ animationDelay: (index * -2.4) + "s", animationDuration: (10 + index * 1.3) + "s", "--mai-drift": ((index % 2 ? -1 : 1) * (22 + index * 8)) + "px" } as CSSProperties}
          >
            <path d="M0 0 Q-8 -9 -2 -15 Q7 -12 6 -4 Q4 -1 0 0 Z" fill="#F7D46A" stroke="#DDAE4F" strokeWidth="1" />
          </g>
        </g>
      ))}
      {burst > 0 && (
        <g key={"burst-" + burst}>
          {PETAL_POSITIONS.map(([x, y], index) => (
            <g key={index} transform={"translate(" + x + " " + y + ")"}>
              <g
                className="memory-mai-falling-petal memory-mai-falling-petal--burst"
                style={{ animationDelay: (index * .095) + "s", animationDuration: (3.8 + index % 4 * .4) + "s", "--mai-drift": ((index % 2 ? -1 : 1) * (38 + index * 6)) + "px" } as CSSProperties}
              >
                <path d="M0 0 Q-8 -9 -2 -15 Q7 -12 6 -4 Q4 -1 0 0 Z" fill={index % 3 ? "#F7CE57" : "#FFE28A"} stroke="#DDAE4F" strokeWidth="1" />
              </g>
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

/**
 * Self-contained, read-only visual. Stage is supplied by the parent; no API,
 * review log or streak logic lives here. Click the ancient tree to shed petals.
 */
export function MemoryMaiTree({
  stage,
  className = "",
  animate = true,
  showFallingPetals = true,
}: {
  stage: MemoryMaiStage;
  className?: string;
  animate?: boolean;
  showFallingPetals?: boolean;
}) {
  const id = useId();
  const reduced = useReducedMotion();
  const animated = animate && !reduced;
  const [burst, setBurst] = useState(0);
  const isAncient = stage === 30;

  return (
    <div className={"memory-mai-tree " + className}>
      <button
        type="button"
        className="memory-mai-tree__canvas"
        aria-label={isAncient ? "Cây mai cổ thụ. Nhấn để thả cánh hoa mai." : STAGE_NAMES[stage]}
        title={isAncient ? "Chạm vào cây để thả hoa" : undefined}
        disabled={!isAncient || !animated}
        onClick={() => setBurst((value) => value + 1)}
      >
        <svg viewBox="0 0 560 500" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
          <g opacity=".42">
            <circle cx="280" cy="251" r="167" stroke="#E6D8B9" strokeWidth="1.7" fill="none" strokeDasharray="2 10" />
            <path d="M81 406 h40 M439 406 h40" stroke="#D3C19D" strokeWidth="2" strokeLinecap="round" />
            <circle cx="100" cy="185" r="3" fill="#DDBF82" />
            <circle cx="460" cy="146" r="2.5" fill="#DDBF82" />
          </g>
          <Soil />
          <AnimatePresence mode="wait" initial>
            <motion.g
              key={id + "-" + stage}
              initial={animated ? { opacity: 0, scale: .88, y: 12 } : false}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={animated ? { opacity: 0, scale: 1.025, y: -7 } : undefined}
              transition={{ duration: .45, ease: "easeOut" }}
              style={{ transformOrigin: "280px 439px" }}
            >
              {stage === 0 ? <MaiSeed animated={animated} /> : stage === 3 ? <MaiSprout animated={animated} /> : (
                <WoodyTree stage={stage} animated={animated} />
              )}
            </motion.g>
          </AnimatePresence>
          {isAncient && animated && showFallingPetals && <FallingPetals burst={burst} idle />}
          {isAncient && (
            <g fill="#EAC45C" opacity=".7">
              <ellipse cx="205" cy="442" rx="5" ry="2.5" transform="rotate(-23 205 442)" />
              <ellipse cx="334" cy="448" rx="4.5" ry="2" transform="rotate(38 334 448)" />
              <ellipse cx="380" cy="441" rx="4" ry="2.3" />
            </g>
          )}
        </svg>
      </button>
    </div>
  );
}
