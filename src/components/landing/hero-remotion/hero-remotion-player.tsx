"use client";

import React from "react";
import { Player } from "@remotion/player";
import {
  HeroRemotionComposition,
  REMOTION_FPS,
  REMOTION_TOTAL_FRAMES,
} from "./remotion-composition";

export function HeroRemotionPlayer() {
  return (
    <div className="w-full relative overflow-hidden rounded-3xl">
      <Player
        component={HeroRemotionComposition}
        durationInFrames={REMOTION_TOTAL_FRAMES}
        fps={REMOTION_FPS}
        compositionWidth={720}
        compositionHeight={540}
        style={{
          width: "100%",
          height: "auto",
          aspectRatio: "4 / 3",
          maxHeight: "540px",
        }}
        autoPlay
        loop
        clickToPlay
        showVolumeControls={false}
      />
    </div>
  );
}
