# ngampUS Hero Video (Remotion)

npm install
npm run studio            # preview + edit di browser
npm run render            # -> out/ngampus-hero-4x5.mp4 (1080x1350, 12 dtk, 30fps)
npm run render:vertical   # -> out/ngampus-hero-9x16.mp4 (1080x1920, untuk TikTok/Reels)

Edit cepat:
- Teks & data   : src/demoData.ts
- Warna & font  : src/theme.ts  (font di public/fonts)
- Timing adegan : src/timing.ts
- Adegan A-D    : src/HeroStory.tsx
