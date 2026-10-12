import React, { useEffect, useState } from 'react';

const FLIP_STAGES = [
  'Idle',
  'Turning',
  'Mid Flip',
  'Settling',
  'Next Page',
] as const;

/**
 * Smooth cubic ease-in-out helper for natural physical paper motion
 */
function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * Linear interpolation helper
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export const PageLoader: React.FC = () => {
  // Normalized cycle progress in [0, 1] at 60fps
  const [cycleProgress, setCycleProgress] = useState(0.28);

  useEffect(() => {
    let rafId: number;
    const CYCLE_MS = 2700;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startTime) % CYCLE_MS;
      setCycleProgress(elapsed / CYCLE_MS);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Map cycleProgress [0..1] to the 5 discrete stages (0..4) for the 5 pagination dots
  // 0: Idle (0.00 - 0.16)
  // 1: Turning (0.16 - 0.38)
  // 2: Mid Flip (0.38 - 0.62)
  // 3: Settling (0.62 - 0.84)
  // 4: Next Page (0.84 - 1.00)
  const activeStageIndex =
    cycleProgress < 0.16
      ? 0
      : cycleProgress < 0.38
      ? 1
      : cycleProgress < 0.62
      ? 2
      : cycleProgress < 0.84
      ? 3
      : 4;

  // Normalized flip parameter u in [0, 1]:
  // During Idle (0..0.14), u = 0 (page rests on left).
  // During active turn (0.14..0.86), u eases smoothly from 0 to 1.
  // During Next Page settle (0.86..1.0), u = 1 (page rests flat on right).
  const rawTurn =
    cycleProgress <= 0.14
      ? 0
      : cycleProgress >= 0.86
      ? 1
      : (cycleProgress - 0.14) / 0.72;

  const u = easeInOutCubic(rawTurn);
  const theta = u * Math.PI; // 0 (Left flat) -> PI/2 (Mid Flip at spine) -> PI (Right flat)
  const sinT = Math.sin(theta);
  const cosT = Math.cos(theta);

  // Spine coordinates
  const spineTopX = 200;
  const spineTopY = 68;
  const spineBotX = 200;
  const spineBotY = 204;

  // Compute 3D curved outer corners of the flipping page
  // Top outer corner arcs high above the spine during Mid Flip
  const pageRadiusTop = 132;
  const topCornerX = spineTopX - cosT * pageRadiusTop + sinT * 16;
  const topCornerY =
    lerp(34, 34, u) - sinT * 52 + Math.sin(u * Math.PI * 2) * 3;

  // Bottom outer corner curls inward & upward more strongly during Turning & Settling (paper curl physics)
  const curlFactor = Math.pow(sinT, 0.85);
  const pageRadiusBot = 140 * (1 - 0.18 * sinT);
  const botCornerX =
    spineBotX - cosT * pageRadiusBot - Math.sin(theta * 2) * 8;
  const botCornerY = lerp(176, 176, u) - curlFactor * 64;

  // Control points for the top edge, outer edge, and bottom curl of the turning leaf
  const topCtrlX = lerp(spineTopX, topCornerX, 0.52) + sinT * 14;
  const topCtrlY = Math.min(spineTopY, topCornerY) - sinT * 14 - 4;

  const outerCtrlX = lerp(topCornerX, botCornerX, 0.5) + sinT * (u < 0.5 ? -8 : 10);
  const outerCtrlY = lerp(topCornerY, botCornerY, 0.5) - sinT * 6;

  const botCtrlX = lerp(botCornerX, spineBotX, 0.48) + sinT * (u < 0.5 ? 12 : 22);
  const botCtrlY = lerp(botCornerY, spineBotY, 0.38) - curlFactor * 18;

  // Closed SVG path for the 3D turning page leaf
  const flippingPagePath = `
    M ${spineTopX} ${spineTopY}
    Q ${topCtrlX} ${topCtrlY} ${topCornerX} ${topCornerY}
    Q ${outerCtrlX} ${outerCtrlY} ${botCornerX} ${botCornerY}
    Q ${botCtrlX} ${botCtrlY} ${spineBotX} ${spineBotY}
    Z
  `;

  // Dynamic cast shadow projected onto the underlying page
  const shadowOpacity = sinT * 0.22;
  const shadowSpreadX =
    u < 0.5
      ? botCornerX - sinT * 18
      : botCornerX + sinT * 24;
  const shadowSpreadY = botCornerY + 18 + sinT * 16;

  const castShadowPath = `
    M ${spineTopX} ${spineTopY + 4}
    Q ${topCtrlX} ${topCtrlY + 14} ${lerp(topCornerX, shadowSpreadX, 0.45)} ${topCornerY + 22}
    Q ${shadowSpreadX} ${ (topCornerY + shadowSpreadY) * 0.5 } ${shadowSpreadX} ${shadowSpreadY}
    Q ${lerp(shadowSpreadX, spineBotX, 0.5)} ${spineBotY + 4} ${spineBotX} ${spineBotY}
    Z
  `;

  // Show flipping leaf only when lifting/turning (avoids z-fighting when completely flat)
  const showFlippingLeaf = rawTurn > 0.005 && rawTurn < 0.995;

  // Generate 5 curved skeleton text lines on the turning leaf itself
  const flippingLines = [0.22, 0.36, 0.50, 0.64, 0.78].map((rowFrac, idx) => {
    const sy = lerp(spineTopY, spineBotY, rowFrac);
    const ox = lerp(topCornerX, botCornerX, rowFrac);
    const oy = lerp(topCornerY, botCornerY, rowFrac);

    // Margin insets from spine and outer edge
    const startT = 0.16;
    const endT = idx === 4 ? 0.58 : 0.82;

    const x1 = lerp(spineTopX, ox, startT);
    const y1 = lerp(sy, oy, startT) - sinT * 4;
    const x2 = lerp(spineTopX, ox, endT);
    const y2 = lerp(sy, oy, endT) - sinT * 6;
    const cx = lerp(x1, x2, 0.5) + sinT * 6;
    const cy = lerp(y1, y2, 0.5) - sinT * 8;

    return {
      d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,
      opacity: Math.max(0.15, Math.abs(cosT) * 0.75),
    };
  });

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8F9FA] dark:bg-[#0E0E11] text-neutral-900 dark:text-neutral-100 transition-colors select-none px-4"
      role="status"
      aria-label={`Loading MD Writer (${FLIP_STAGES[activeStageIndex]})`}
    >
      {/* 3D Open Book Illustration Container */}
      <div className="relative w-72 sm:w-88 h-44 sm:h-54 flex items-center justify-center book-loader-float">
        <svg
          viewBox="0 0 400 245"
          fill="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Soft Studio Ambient Drop Shadow Underneath Book */}
            <filter id="bookAmbientShadow" x="-20%" y="-20%" width="140%" height="150%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="14" />
            </filter>

            <filter id="bookContactShadow" x="-15%" y="-15%" width="130%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
            </filter>

            {/* Cast Shadow Filter for Turning Page */}
            <filter id="pageTurnShadowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
            </filter>

            {/* Left Page Surface Gradient (bright paper -> soft spine crease shading) */}
            <linearGradient id="leftPageSurface" x1="56" y1="115" x2="200" y2="115" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="74%" stopColor="#FDFDFE" />
              <stop offset="91%" stopColor="#F1F3F7" />
              <stop offset="100%" stopColor="#E1E5EC" />
            </linearGradient>

            {/* Right Page Surface Gradient (soft spine crease shading -> bright paper) */}
            <linearGradient id="rightPageSurface" x1="200" y1="115" x2="344" y2="115" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#DCE1E9" />
              <stop offset="9%" stopColor="#EFF1F6" />
              <stop offset="28%" stopColor="#FCFDFE" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>

            {/* Turning Page Dynamic 3D Curvature Shading */}
            <linearGradient
              id="turningPageGrad"
              x1={spineTopX}
              y1="110"
              x2={topCornerX}
              y2="110"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#E3E7EF" />
              <stop offset="22%" stopColor="#F7F8FB" />
              <stop offset="65%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F4F6F9" />
            </linearGradient>

            {/* Stacked Page Edge Gradients */}
            <linearGradient id="stackCoverGrad" x1="48" y1="120" x2="352" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#B4BAC6" />
              <stop offset="48%" stopColor="#9FA6B2" />
              <stop offset="52%" stopColor="#9FA6B2" />
              <stop offset="100%" stopColor="#B4BAC6" />
            </linearGradient>

            <linearGradient id="stackMidGrad" x1="52" y1="120" x2="348" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#CFD4DE" />
              <stop offset="50%" stopColor="#BFC5D0" />
              <stop offset="100%" stopColor="#CFD4DE" />
            </linearGradient>

            <linearGradient id="stackInnerGrad" x1="55" y1="120" x2="345" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E6E9F0" />
              <stop offset="50%" stopColor="#D8DCE5" />
              <stop offset="100%" stopColor="#E6E9F0" />
            </linearGradient>
          </defs>

          {/* 1. DIFFUSED AMBIENT FLOOR SHADOW UNDER OPEN BOOK */}
          <path
            d="M 62 184 Q 130 196 200 214 Q 270 196 338 184 Q 346 202 200 226 Q 54 202 62 184 Z"
            fill="#0F172A"
            opacity="0.13"
            filter="url(#bookAmbientShadow)"
          />
          <ellipse
            cx="200"
            cy="208"
            rx="128"
            ry="14"
            fill="#0F172A"
            opacity="0.09"
            filter="url(#bookContactShadow)"
          />

          {/* 2. MULTI-LAYERED BOOK COVER & PAGE STACK EDGES */}
          {/* Outer Cover / Layer 3 (Bottom-most thickness) */}
          <path
            d="
              M 200 76
              Q 132 54 64 42
              Q 50 40 49 54
              L 42 174
              Q 41 190 58 192
              Q 130 199 200 212
              Q 270 199 342 192
              Q 359 190 358 174
              L 351 54
              Q 350 40 336 42
              Q 268 54 200 76
              Z
            "
            fill="url(#stackCoverGrad)"
          />

          {/* Middle Page Stack / Layer 2 */}
          <path
            d="
              M 200 73
              Q 133 50 66 39
              Q 53 37 52 50
              L 46 170
              Q 45 185 61 187
              Q 131 195 200 209
              Q 269 195 339 187
              Q 355 185 354 170
              L 348 50
              Q 347 37 334 39
              Q 267 50 200 73
              Z
            "
            fill="url(#stackMidGrad)"
          />

          {/* Upper Page Stack / Layer 1 */}
          <path
            d="
              M 200 70
              Q 134 47 68 36
              Q 56 34 55 47
              L 50 166
              Q 49 180 64 182
              Q 132 191 200 206
              Q 268 191 336 182
              Q 351 180 350 166
              L 345 47
              Q 344 34 332 36
              Q 266 47 200 70
              Z
            "
            fill="url(#stackInnerGrad)"
          />

          {/* 3. TOP RESTING LEFT PAGE */}
          <path
            d="
              M 200 68
              Q 135 44 70 33
              Q 59 31 58 43
              L 54 161
              Q 53 175 67 177
              Q 133 186 200 204
              Z
            "
            fill="url(#leftPageSurface)"
            stroke="#EAEDF2"
            strokeWidth="0.75"
          />

          {/* 4. TOP RESTING RIGHT PAGE */}
          <path
            d="
              M 200 68
              Q 265 44 330 33
              Q 341 31 342 43
              L 346 161
              Q 347 175 333 177
              Q 267 186 200 204
              Z
            "
            fill="url(#rightPageSurface)"
            stroke="#EAEDF2"
            strokeWidth="0.75"
          />

          {/* 5. LEFT PAGE SKELETON TEXT LINES (Slanted along left page perspective) */}
          <g strokeLinecap="round">
            {/* Short Bold Chapter Heading Line */}
            <path
              d="M 82 58 Q 104 62 126 67"
              stroke="#D5D9E2"
              strokeWidth="4.2"
            />
            {/* Body Line 1 */}
            <path
              d="M 81 78 Q 124 86 164 96"
              stroke="#E1E4EC"
              strokeWidth="3.2"
            />
            <path
              d="M 164 96 Q 173 98 181 100"
              stroke="#ECEEF3"
              strokeWidth="3.2"
            />
            {/* Body Line 2 */}
            <path
              d="M 80 95 Q 130 104 180 117"
              stroke="#E1E4EC"
              strokeWidth="3.2"
            />
            {/* Body Line 3 */}
            <path
              d="M 79 112 Q 129 121 179 134"
              stroke="#E1E4EC"
              strokeWidth="3.2"
            />
            {/* Body Line 4 */}
            <path
              d="M 78 129 Q 128 139 178 151"
              stroke="#E1E4EC"
              strokeWidth="3.2"
            />
            {/* Body Line 5 (Two-tone trailing line) */}
            <path
              d="M 77 146 Q 112 153 146 161"
              stroke="#DDE1EA"
              strokeWidth="3.2"
            />
            <path
              d="M 146 161 Q 162 165 177 168"
              stroke="#ECEEF4"
              strokeWidth="3.2"
            />
          </g>

          {/* 6. RIGHT PAGE SKELETON TEXT LINES (Slanted along right page perspective) */}
          <g strokeLinecap="round">
            {/* Body Line 1 */}
            <path
              d="M 219 83 Q 268 71 317 61"
              stroke="#E6E9F0"
              strokeWidth="3.2"
            />
            {/* Body Line 2 */}
            <path
              d="M 219 100 Q 268 88 318 78"
              stroke="#E2E5ED"
              strokeWidth="3.2"
            />
            {/* Body Line 3 */}
            <path
              d="M 219 117 Q 254 108 290 101"
              stroke="#DDE1EA"
              strokeWidth="3.2"
            />
            <path
              d="M 290 101 Q 304 98 319 95"
              stroke="#ECEFF4"
              strokeWidth="3.2"
            />
            {/* Body Line 4 */}
            <path
              d="M 219 134 Q 269 122 320 112"
              stroke="#E1E4EC"
              strokeWidth="3.2"
            />
            {/* Body Line 5 */}
            <path
              d="M 219 151 Q 270 139 321 129"
              stroke="#E1E4EC"
              strokeWidth="3.2"
            />
            {/* Body Line 6 (Short paragraph end) */}
            <path
              d="M 219 168 Q 248 161 276 155"
              stroke="#DDE1EA"
              strokeWidth="3.2"
            />
          </g>

          {/* 7. CENTRAL SPINE CREASE LINE */}
          <line
            x1="200"
            y1="68"
            x2="200"
            y2="205"
            stroke="#CFD5E0"
            strokeWidth="1.1"
          />

          {/* 8. ANIMATED 3D FLIPPING PAGE LEAF & CAST SHADOW */}
          {showFlippingLeaf && (
            <g>
              {/* Soft Cast Shadow on Underlying Page */}
              <path
                d={castShadowPath}
                fill="#0F172A"
                opacity={shadowOpacity}
                filter="url(#pageTurnShadowFilter)"
              />

              {/* Curved 3D Turning Page Leaf */}
              <path
                d={flippingPagePath}
                fill="url(#turningPageGrad)"
                stroke="#E2E6EE"
                strokeWidth="0.9"
              />

              {/* Dynamic Skeleton Lines on the Turning Page */}
              <g strokeLinecap="round">
                {flippingLines.map((line, i) => (
                  <path
                    key={i}
                    d={line.d}
                    stroke="#DFE3EC"
                    strokeWidth="3"
                    opacity={line.opacity}
                  />
                ))}
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Typography & 5-Stage Pagination Dots Indicator */}
      <div className="mt-1 flex flex-col items-center text-center">
        <h2 className="text-[20px] sm:text-[22px] font-semibold tracking-[-0.015em] text-[#1E232D] dark:text-neutral-100 font-sans">
          MD Writer
        </h2>

        <p className="mt-1.5 text-[10px] sm:text-[11px] font-medium tracking-[0.38em] pl-[0.38em] text-[#949BA6] dark:text-neutral-400 uppercase font-sans">
          LOADING...
        </p>

        {/* 5 Synchronized Stage Dots (1. Idle -> 2. Turning -> 3. Mid Flip -> 4. Settling -> 5. Next Page) */}
        <div
          className="mt-3.5 flex items-center justify-center gap-2.5"
          aria-hidden="true"
        >
          {FLIP_STAGES.map((stageName, idx) => {
            const isActive = idx === activeStageIndex;
            return (
              <span
                key={stageName}
                className={`rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-2 h-2 bg-[#2563EB] dark:bg-[#3B82F6] shadow-[0_0_8px_rgba(37,99,235,0.45)] scale-110'
                    : 'w-1.75 h-1.75 bg-[#D5D9E0] dark:bg-neutral-700'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
