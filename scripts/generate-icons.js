import sharp from "sharp";
import fs from "fs";
import path from "path";

// Exact Samskrit Bharat Logo SVG matching user's image
export const samskritBharatSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Royal Navy Background Gradient -->
    <radialGradient id="navyBg" cx="50%" cy="45%" r="55%" fx="45%" fy="40%">
      <stop offset="0%" stop-color="#223a6e"/>
      <stop offset="50%" stop-color="#152750"/>
      <stop offset="85%" stop-color="#0f1d3e"/>
      <stop offset="100%" stop-color="#081024"/>
    </radialGradient>

    <!-- Rich Gold Shimmer Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff0a3"/>
      <stop offset="25%" stop-color="#f5ce62"/>
      <stop offset="60%" stop-color="#dfaa32"/>
      <stop offset="100%" stop-color="#b07d12"/>
    </linearGradient>

    <!-- Warm Glowing Sunburst Behind Lotus -->
    <radialGradient id="lotusGlow" cx="50%" cy="48%" r="40%">
      <stop offset="0%" stop-color="#ffb347" stop-opacity="0.95"/>
      <stop offset="35%" stop-color="#ff8c00" stop-opacity="0.75"/>
      <stop offset="65%" stop-color="#d97706" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#152750" stop-opacity="0"/>
    </radialGradient>

    <!-- Text Curved Path -->
    <path id="textArc" d="M 92,256 A 164,164 0 0,1 420,256" fill="none"/>

    <!-- Subtle Drop Shadow -->
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Outer Circle Background -->
  <circle cx="256" cy="256" r="252" fill="url(#navyBg)"/>

  <!-- Double Golden Concentric Borders -->
  <circle cx="256" cy="256" r="242" fill="none" stroke="url(#goldGrad)" stroke-width="4.5"/>
  <circle cx="256" cy="256" r="232" fill="none" stroke="url(#goldGrad)" stroke-width="2.5"/>

  <!-- Arched Curved Text: SAMSKRIT BHARAT -->
  <text font-family="'Cinzel', 'Georgia', 'Times New Roman', 'Palatino Linotype', serif" font-weight="bold" font-size="34" letter-spacing="4.5" fill="url(#goldGrad)" filter="url(#softShadow)">
    <textPath href="#textArc" startOffset="50%" text-anchor="middle">
      SAMSKRIT BHARAT
    </textPath>
  </text>

  <!-- Radiant Warm Golden Sunburst Glow Behind Lotus -->
  <circle cx="256" cy="245" r="105" fill="url(#lotusGlow)" pointer-events="none"/>

  <!-- Golden Blooming Lotus Flower -->
  <g id="lotus-flower" stroke="url(#goldGrad)" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#softShadow)">
    <!-- Central Flame Petal -->
    <path d="M 256,150 C 248,180 240,215 256,260 C 272,215 264,180 256,150 Z" stroke-width="3.5" fill="#f5ce62" fill-opacity="0.12"/>

    <!-- Inner Left Petal -->
    <path d="M 256,150 C 230,175 210,215 240,265 C 248,245 252,215 256,150" stroke-width="3.2"/>

    <!-- Inner Right Petal -->
    <path d="M 256,150 C 282,175 302,215 272,265 C 264,245 260,215 256,150" stroke-width="3.2"/>

    <!-- Mid Left Petal -->
    <path d="M 256,180 C 205,185 185,225 220,270" stroke-width="3.2"/>

    <!-- Mid Right Petal -->
    <path d="M 256,180 C 307,185 327,225 292,270" stroke-width="3.2"/>

    <!-- Outer Left Curving Petal (Pointed Tip) -->
    <path d="M 220,185 C 190,175 160,205 150,225 C 145,235 155,245 175,242 C 195,240 215,255 225,275" stroke-width="3.2"/>

    <!-- Outer Right Curving Petal (Pointed Tip) -->
    <path d="M 292,185 C 322,175 352,205 362,225 C 367,235 357,245 337,242 C 317,240 297,255 287,275" stroke-width="3.2"/>

    <!-- Lower Left Wing Petal -->
    <path d="M 175,242 C 140,248 135,268 160,278 C 180,285 205,282 230,280" stroke-width="3.2"/>

    <!-- Lower Right Wing Petal -->
    <path d="M 337,242 C 372,248 377,268 352,278 C 332,285 307,282 282,280" stroke-width="3.2"/>

    <!-- Center Base Loop / Stalk Scroll -->
    <path d="M 256,260 C 253,275 246,285 251,295 C 255,302 262,302 263,293 C 264,285 258,278 256,268" stroke-width="3" stroke-linecap="round"/>
  </g>

  <!-- Horizontal Horizon Accent Lines -->
  <line x1="85" y1="298" x2="242" y2="298" stroke="url(#goldGrad)" stroke-width="2"/>
  <line x1="270" y1="298" x2="427" y2="298" stroke="url(#goldGrad)" stroke-width="2"/>

  <!-- Open Scripture / Book (ग्रन्थ) at Base -->
  <g id="open-book" stroke="url(#goldGrad)" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#softShadow)">
    <!-- Book Left Side Pages Curve -->
    <path d="M 256,310 C 215,300 170,305 145,338 L 120,338 C 150,300 205,296 256,306 Z" stroke-width="3" fill="#f5ce62" fill-opacity="0.2"/>

    <!-- Book Right Side Pages Curve -->
    <path d="M 256,310 C 297,300 342,305 367,338 L 392,338 C 362,300 307,296 256,306 Z" stroke-width="3" fill="#f5ce62" fill-opacity="0.2"/>

    <!-- Bottom Cover Base Lines -->
    <path d="M 117,340 L 140,340 C 180,312 225,315 256,325 C 287,315 332,312 372,340 L 395,340" stroke-width="3.5"/>

    <!-- Lower Spine Binding Arc -->
    <path d="M 245,340 C 250,346 262,346 267,340" stroke-width="3.2"/>

    <!-- Internal Page Lines - Left -->
    <path d="M 152,328 C 185,312 220,314 252,320" stroke-width="2.2"/>
    <path d="M 162,320 C 190,309 220,310 250,315" stroke-width="2"/>

    <!-- Internal Page Lines - Right -->
    <path d="M 360,328 C 327,312 292,314 260,320" stroke-width="2.2"/>
    <path d="M 350,320 C 322,309 292,310 262,315" stroke-width="2"/>
  </g>
</svg>
`;

// Maskable version with safe padding for Android
export const maskableSamskritBharatSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="navyBg" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#223a6e"/>
      <stop offset="50%" stop-color="#152750"/>
      <stop offset="85%" stop-color="#0f1d3e"/>
      <stop offset="100%" stop-color="#081024"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff0a3"/>
      <stop offset="25%" stop-color="#f5ce62"/>
      <stop offset="60%" stop-color="#dfaa32"/>
      <stop offset="100%" stop-color="#b07d12"/>
    </linearGradient>
    <radialGradient id="lotusGlow" cx="50%" cy="48%" r="40%">
      <stop offset="0%" stop-color="#ffb347" stop-opacity="0.95"/>
      <stop offset="35%" stop-color="#ff8c00" stop-opacity="0.75"/>
      <stop offset="65%" stop-color="#d97706" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#152750" stop-opacity="0"/>
    </radialGradient>
    <path id="textArcMaskable" d="M 120,256 A 136,136 0 0,1 392,256" fill="none"/>
  </defs>

  <!-- Full-bleed background for maskable squircle safe zone -->
  <rect width="512" height="512" fill="url(#navyBg)"/>

  <!-- Centered Scaled Inner Emblem for Safe Zone -->
  <g transform="translate(51, 51) scale(0.8)">
    <circle cx="256" cy="256" r="242" fill="none" stroke="url(#goldGrad)" stroke-width="4.5"/>
    <circle cx="256" cy="256" r="232" fill="none" stroke="url(#goldGrad)" stroke-width="2.5"/>

    <!-- Text -->
    <text font-family="'Cinzel', 'Georgia', 'Times New Roman', serif" font-weight="bold" font-size="34" letter-spacing="4.5" fill="url(#goldGrad)">
      <textPath href="#textArcMaskable" startOffset="50%" text-anchor="middle">
        SAMSKRIT BHARAT
      </textPath>
    </text>

    <!-- Glow -->
    <circle cx="256" cy="245" r="105" fill="url(#lotusGlow)"/>

    <!-- Lotus -->
    <g stroke="url(#goldGrad)" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 256,150 C 248,180 240,215 256,260 C 272,215 264,180 256,150 Z" stroke-width="3.5" fill="#f5ce62" fill-opacity="0.15"/>
      <path d="M 256,150 C 230,175 210,215 240,265 C 248,245 252,215 256,150" stroke-width="3.2"/>
      <path d="M 256,150 C 282,175 302,215 272,265 C 264,245 260,215 256,150" stroke-width="3.2"/>
      <path d="M 256,180 C 205,185 185,225 220,270" stroke-width="3.2"/>
      <path d="M 256,180 C 307,185 327,225 292,270" stroke-width="3.2"/>
      <path d="M 220,185 C 190,175 160,205 150,225 C 145,235 155,245 175,242 C 195,240 215,255 225,275" stroke-width="3.2"/>
      <path d="M 292,185 C 322,175 352,205 362,225 C 367,235 357,245 337,242 C 317,240 297,255 287,275" stroke-width="3.2"/>
      <path d="M 175,242 C 140,248 135,268 160,278 C 180,285 205,282 230,280" stroke-width="3.2"/>
      <path d="M 337,242 C 372,248 377,268 352,278 C 332,285 307,282 282,280" stroke-width="3.2"/>
      <path d="M 256,260 C 253,275 246,285 251,295 C 255,302 262,302 263,293 C 264,285 258,278 256,268" stroke-width="3"/>
    </g>

    <line x1="85" y1="298" x2="242" y2="298" stroke="url(#goldGrad)" stroke-width="2"/>
    <line x1="270" y1="298" x2="427" y2="298" stroke="url(#goldGrad)" stroke-width="2"/>

    <!-- Book -->
    <g stroke="url(#goldGrad)" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 256,310 C 215,300 170,305 145,338 L 120,338 C 150,300 205,296 256,306 Z" stroke-width="3" fill="#f5ce62" fill-opacity="0.2"/>
      <path d="M 256,310 C 297,300 342,305 367,338 L 392,338 C 362,300 307,296 256,306 Z" stroke-width="3" fill="#f5ce62" fill-opacity="0.2"/>
      <path d="M 117,340 L 140,340 C 180,312 225,315 256,325 C 287,315 332,312 372,340 L 395,340" stroke-width="3.5"/>
      <path d="M 245,340 C 250,346 262,346 267,340" stroke-width="3.2"/>
      <path d="M 152,328 C 185,312 220,314 252,320" stroke-width="2.2"/>
      <path d="M 360,328 C 327,312 292,314 260,320" stroke-width="2.2"/>
    </g>
  </g>
</svg>
`;

async function main() {
  const publicDir = path.resolve("./public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Save standalone logo svg
  fs.writeFileSync(path.join(publicDir, "samskrit-bharat-logo.svg"), samskritBharatSvg.trim());
  fs.writeFileSync(path.join(publicDir, "favicon.svg"), samskritBharatSvg.trim());
  console.log("Saved samskrit-bharat-logo.svg and favicon.svg");

  // 1. Generate icon-512.png
  await sharp(Buffer.from(samskritBharatSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, "icon-512.png"));
  console.log("Generated public/icon-512.png");

  // 2. Generate icon-192.png
  await sharp(Buffer.from(samskritBharatSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, "icon-192.png"));
  console.log("Generated public/icon-192.png");

  // 3. Generate maskable-icon-512.png
  await sharp(Buffer.from(maskableSamskritBharatSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, "maskable-icon-512.png"));
  console.log("Generated public/maskable-icon-512.png");

  // 4. Generate apple-touch-icon.png (180x180)
  await sharp(Buffer.from(samskritBharatSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));
  console.log("Generated public/apple-touch-icon.png");

  // Also copy to src/assets for direct import if needed
  const assetsDir = path.resolve("./src/assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  fs.writeFileSync(path.join(assetsDir, "samskrit-bharat-logo.svg"), samskritBharatSvg.trim());
}

main().catch(console.error);
