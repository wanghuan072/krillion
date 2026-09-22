import sharp from "sharp";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="128" viewBox="0 0 480 128">
  <rect width="480" height="128" fill="none"/>
  <g transform="translate(8 12)">
    <rect width="96" height="96" rx="5" fill="#c7ff38"/>
    <path d="M27 22V75H40V58L56 75H75L51 50L73 22H56L40 44V22Z" fill="#0b0c09"/>
    <path d="M26 84H79" stroke="#0b0c09" stroke-width="4"/>
  </g>
  <g transform="translate(126 15)">
    <text x="0" y="58" fill="#f3f0e8" font-family="DejaVu Sans, Arial, sans-serif" font-size="53" font-weight="900" letter-spacing="4">KRILLION</text>
    <text x="2" y="91" fill="#aaa99f" font-family="DejaVu Sans Mono, monospace" font-size="13" font-weight="600" letter-spacing="4">PLAY MORE. PLAY FURTHER.</text>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).resize(240, 64).png().toFile("public/images/logo.png");
console.log("Created public/images/logo.png");
