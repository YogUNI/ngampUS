import React from "react";
import { Sequence } from "remotion";
import { TIMING } from "../timing";
import { SceneChaos } from "../scenes/SceneChaos";
import { SceneHardCut } from "../scenes/SceneHardCut";
import { SceneOrganized } from "../scenes/SceneOrganized";
import { SceneOutcome } from "../scenes/SceneOutcome";

export const HeroStory: React.FC = () => {
  return (
    <div
      style={{
        width: TIMING.WIDTH_4_5,
        height: TIMING.HEIGHT_4_5,
        backgroundColor: TIMING.COLORS.bgDark,
      }}
      className="relative flex items-center justify-center overflow-hidden font-sans select-none"
    >
      {/* SCENE 1: KACAU (Frames 0 - 90 / 0-3s) */}
      <Sequence
        from={TIMING.SCENE_CHAOS.start}
        durationInFrames={TIMING.SCENE_CHAOS.duration}
        name="SceneChaos"
      >
        <SceneChaos />
      </Sequence>

      {/* SCENE 2: HARD CUT (Frames 90 - 135 / 3-4.5s) */}
      <Sequence
        from={TIMING.SCENE_HARD_CUT.start}
        durationInFrames={TIMING.SCENE_HARD_CUT.duration}
        name="SceneHardCut"
      >
        <SceneHardCut />
      </Sequence>

      {/* SCENE 3: RAPI (Frames 135 - 270 / 4.5-9s) */}
      <Sequence
        from={TIMING.SCENE_ORGANIZED.start}
        durationInFrames={TIMING.SCENE_ORGANIZED.duration}
        name="SceneOrganized"
      >
        <SceneOrganized />
      </Sequence>

      {/* SCENE 4: HASIL (Frames 270 - 360 / 9-12s) */}
      <Sequence
        from={TIMING.SCENE_OUTCOME.start}
        durationInFrames={TIMING.SCENE_OUTCOME.duration}
        name="SceneOutcome"
      >
        <SceneOutcome />
      </Sequence>
    </div>
  );
};

