'use client';

import React, { useEffect } from 'react';
import './splash.css';
// @ts-ignore
import { initSplash } from './splashEngine';

const MARKUP = `<div id="loader" role="status" aria-live="polite" hidden>
  <i class="lbar"></i>
  <div class="lg"><i style="--i:0"></i><i style="--i:1"></i><i style="--i:2"></i><i style="--i:5"></i><i class="h" style="--i:4"></i><i style="--i:3"></i><i style="--i:6"></i><i style="--i:7"></i><i style="--i:8"></i></div>
  <div id="lmsg"></div>
</div>

<div id="splash" aria-hidden="true">
  <div class="pn l"></div>
  <div class="pn d">
    <div class="grain"></div><div class="vg"></div>
    <div class="scene"><svg viewBox="0 0 600 560" aria-hidden="true"><g class="cam"><g class="room">
<rect x="60" y="60" width="240" height="160" rx="12" fill="#F4F1EA" stroke="#12332a" stroke-width="6"/>
<path class="scr" style="--i:0" d="M80 90l50 22-44 14 60 18-52 20 90-6" fill="none" stroke="#FF4D3D" stroke-width="4" stroke-linecap="round"/>
<path class="scr" style="--i:1" d="M170 84l80 26-70 10 70 24-90 8" fill="none" stroke="#FF4D3D" stroke-width="4" stroke-linecap="round"/>
<g class="ck" style="--i:0"><path d="M80 110l9 9 16-18" fill="none" stroke="#1f6f4a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><text x="118" y="116" font-size="17" fill="#0b140f">Jadwal rapi</text></g>
<g class="ck" style="--i:1"><path d="M80 148l9 9 16-18" fill="none" stroke="#1f6f4a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><text x="118" y="154" font-size="17" fill="#0b140f">Deadline aman</text></g>
<g class="ck" style="--i:2"><path d="M80 186l9 9 16-18" fill="none" stroke="#1f6f4a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><text x="118" y="192" font-size="17" fill="#0b140f">Organisasi jalan</text></g>
<circle cx="470" cy="100" r="44" fill="#F4F1EA" stroke="#12332a" stroke-width="6"/>
<g class="hand"><line x1="470" y1="100" x2="470" y2="68" stroke="#0b140f" stroke-width="4" stroke-linecap="round"/></g><line x1="470" y1="100" x2="486" y2="108" stroke="#FF4D3D" stroke-width="4" stroke-linecap="round"/><circle cx="470" cy="100" r="5" fill="#0b140f"/>
<g class="sd" style="color:#3b7a63"><rect x="44" y="350" width="76" height="72" rx="30" fill="currentColor"/><circle cx="82" cy="326" r="32" fill="#E8B98F"/><path d="M50 322Q82 282 114 322Q82 306 50 322Z" fill="#0b140f"/><circle cx="71" cy="330" r="3.5" fill="#0b140f"/><circle cx="93" cy="330" r="3.5" fill="#0b140f"/><path d="M74 344h16" stroke="#0b140f" stroke-width="3" stroke-linecap="round"/></g><g class="sd" style="color:#7a5cc4"><rect x="490" y="350" width="76" height="72" rx="30" fill="currentColor"/><circle cx="528" cy="326" r="32" fill="#E8B98F"/><path d="M496 322Q528 282 560 322Q528 306 496 322Z" fill="#0b140f"/><circle cx="517" cy="330" r="3.5" fill="#0b140f"/><circle cx="539" cy="330" r="3.5" fill="#0b140f"/><path d="M520 344h16" stroke="#0b140f" stroke-width="3" stroke-linecap="round"/></g>
<g class="stu"><rect x="246" y="318" width="108" height="106" rx="40" fill="#E9E4D8"/><circle cx="300" cy="272" r="48" fill="#E8B98F"/><path d="M252 266Q300 206 348 266Q326 244 300 246Q272 244 252 266Z" fill="#0b140f"/>
<g class="e1"><path d="M276 266l16 16m0-16l-16 16M308 266l16 16m0-16l-16 16" stroke="#0b140f" stroke-width="4" stroke-linecap="round"/></g>
<g class="e2"><path d="M274 276q9-12 18 0M308 276q9-12 18 0" fill="none" stroke="#0b140f" stroke-width="4" stroke-linecap="round"/></g>
<path class="m1" d="M280 304q7-8 14 0t14 0t14 0" fill="none" stroke="#0b140f" stroke-width="4" stroke-linecap="round"/>
<path class="m2" d="M282 298q18 18 36 0" fill="none" stroke="#0b140f" stroke-width="4" stroke-linecap="round"/>
<path class="sw" style="--i:0" d="M262 248q-7 12 0 16q7-4 0-16z" fill="#7fd3f7"/><path class="sw" style="--i:1" d="M340 244q-7 12 0 16q7-4 0-16z" fill="#7fd3f7"/>
<g class="hd"><circle cx="246" cy="276" r="15" fill="#E8B98F"/><circle cx="354" cy="276" r="15" fill="#E8B98F"/></g></g>
<rect x="20" y="420" width="560" height="26" rx="10" fill="#12332a"/><rect x="20" y="420" width="560" height="4" fill="#C6F432" opacity=".6"/><rect x="40" y="446" width="520" height="70" fill="#0e2a21"/>
<g class="pp" style="--i:0;--fx:-34px;--sx:-60px;--sy:66px"><rect x="190" y="310" width="34" height="44" rx="3" fill="#fff"/><path d="M196 322h22M196 331h22M196 340h14" stroke="#9aa" stroke-width="2"/></g>
<g class="pp" style="--i:1;--fx:40px;--sx:-270px;--sy:80px"><rect x="400" y="290" width="34" height="44" rx="3" fill="#fff"/><path d="M406 302h22M406 311h22M406 320h14" stroke="#9aa" stroke-width="2"/></g>
<g class="pp" style="--i:2;--fx:-30px;--sx:-200px;--sy:-6px"><rect x="330" y="370" width="34" height="44" rx="3" fill="#fff"/><path d="M336 382h22M336 391h22M336 400h14" stroke="#9aa" stroke-width="2"/></g>
<g class="pp" style="--i:3;--fx:30px;--sx:-100px;--sy:128px"><rect x="230" y="230" width="34" height="44" rx="3" fill="#fff"/><path d="M236 242h22M236 251h22M236 260h14" stroke="#9aa" stroke-width="2"/></g>
<g class="bb" style="--i:0"><rect x="120" y="236" width="128" height="34" rx="17" fill="#fff"/><text x="184.0" y="258" text-anchor="middle" font-size="14" fill="#0b140f">999+ pesan WA</text></g><g class="bb" style="--i:1"><rect x="348" y="206" width="128" height="34" rx="17" fill="#FF4D3D"/><text x="412.0" y="228" text-anchor="middle" font-size="14" fill="#fff">tugas besok!</text></g><g class="bb" style="--i:2"><rect x="14" y="262" width="112" height="34" rx="17" fill="#fff"/><text x="70.0" y="284" text-anchor="middle" font-size="14" fill="#0b140f">rapat bentrok?</text></g><g class="bb" style="--i:3"><rect x="430" y="258" width="116" height="34" rx="17" fill="#fff"/><text x="488.0" y="280" text-anchor="middle" font-size="14" fill="#0b140f">modul P5 mana?</text></g>
</g><g class="mm"><g class="mc">
<g class="leg l1"><rect x="40" y="116" width="14" height="26" rx="7" fill="#0b140f"/></g><g class="leg l2"><rect x="66" y="116" width="14" height="26" rx="7" fill="#0b140f"/></g>
<g class="bd"><rect class="bp" x="12" y="64" width="24" height="48" rx="12" fill="#12332a" stroke="#C6F432" stroke-width="2.5"/><rect x="26" y="34" width="78" height="86" rx="38" fill="#C6F432"/>
<g class="arm-l"><path d="M30 88L15 100" stroke="#C6F432" stroke-width="11" stroke-linecap="round"/></g><g class="arm-r"><path d="M100 88L114 100" stroke="#C6F432" stroke-width="11" stroke-linecap="round"/></g>
<circle class="ring" cx="110" cy="70" r="8" fill="none" stroke="#C6F432" stroke-width="3"/>
<g class="eye"><circle cx="48" cy="74" r="7.5" fill="#fff"/><circle cx="50" cy="75" r="3.8" fill="#0b140f"/></g><g class="eye"><circle cx="80" cy="74" r="7.5" fill="#fff"/><circle cx="82" cy="75" r="3.8" fill="#0b140f"/></g>
<ellipse cx="40" cy="90" rx="6" ry="3.5" fill="#FF4D3D" opacity=".35"/><ellipse cx="90" cy="90" rx="6" ry="3.5" fill="#FF4D3D" opacity=".35"/>
<path class="mo-s" d="M54 92Q65 102 76 92" stroke="#0b140f" stroke-width="3.5" fill="none" stroke-linecap="round"/><g class="mo-o" id="mouth"><ellipse cx="65" cy="95" rx="10" ry="9" fill="#04100a"/><ellipse cx="65" cy="102" rx="6.5" ry="3.5" fill="#FF4D3D"/></g>
<rect x="44" y="42" width="42" height="14" rx="4" fill="#0b140f"/><polygon points="20,40 65,22 110,40 65,54" fill="#0b140f"/>
<g class="tas"><path d="M104 41L106 62" stroke="#FF4D3D" stroke-width="3" stroke-linecap="round"/><circle cx="106" cy="65" r="4.5" fill="#FF4D3D"/></g></g></g></g>
<g class="s1"><rect x="396" y="240" width="170" height="36" rx="18" fill="#fff"/><path d="M450 276l6 12 8-12z" fill="#fff"/><text x="481" y="263" text-anchor="middle" font-size="14" fill="#0b140f">tenang, aku bantu</text></g>
<g class="s2"><rect x="410" y="240" width="140" height="36" rx="18" fill="#C6F432"/><path d="M450 276l6 12 8-12z" fill="#C6F432"/><text x="480" y="263" text-anchor="middle" font-size="15" fill="#0b140f">beres. napas dulu.</text></g>
<rect class="fl" x="-100" y="-100" width="800" height="760" fill="#fff"/></g></svg></div>
    <div class="cap" id="cap"></div><div class="hole"></div>
    <div class="hud tl">ngampUS 2026</div>
    <div class="hud tr" id="clk"></div>
    <div class="hud bl" id="mt"><div><span id="lb">level pusing</span><b id="cnt">100</b></div><div class="mb"><i id="fill"></i></div></div>
    <div class="hud br" id="msg"></div>
  </div>
</div>
`;

export function SplashScreen() {
  useEffect(() => {
    const cleanup = initSplash();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  return <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: MARKUP }} />;
}

export default SplashScreen;

