import React from "react";
import { Composition } from "remotion";
import { HeroStory } from "./compositions/HeroStory";
import { HeroStoryVertical } from "./compositions/HeroStoryVertical";
import { TIMING } from "./timing";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HeroStory"
        component={HeroStory}
        durationInFrames={TIMING.TOTAL_FRAMES}
        fps={TIMING.FPS}
        width={TIMING.WIDTH_4_5}
        height={TIMING.HEIGHT_4_5}
      />
      <Composition
        id="HeroStoryVertical"
        component={HeroStoryVertical}
        durationInFrames={TIMING.TOTAL_FRAMES}
        fps={TIMING.FPS}
        width={TIMING.WIDTH_9_16}
        height={TIMING.HEIGHT_9_16}
      />
    </>
  );
};

