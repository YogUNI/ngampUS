import React from "react";
import { Sequence } from "remotion";
import { TIMING } from "../timing";
import { SceneChaos } from "../scenes/SceneChaos";
import { SceneHardCut } from "../scenes/SceneHardCut";
import { SceneOrganized } from "../scenes/SceneOrganized";
import { SceneOutcome } from "../scenes/SceneOutcome";

export const HeroStoryVertical: React.FC = () => {
  return (
    <div
      style={{
        width: TIMING.WIDTH_9_16,
        height: TIMING.HEIGHT_9_16,
        backgroundColor: TIMING.COLORS.bgDark,
      }}
      className="relative flex items-center justify-center overflow-hidden font-sans select-none"
    >
      {/* Top Brand Watermark for Vertical Video */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-[#12332a]/80 backdrop-blur-md px-5 py-2 text-white">
        <span className="h-2.5 w-2.5 rounded-full bg-[#C6F432] animate-pulse" />
        <span className="font-display text-base font-black tracking-tight">
          ngamp<span className="text-[#C6F432]">US</span>
        </span>
        <span className="text-xs text-white/60 font-mono">• Workspace Mahasiswa</span>
      </div>

      {/* SCENE 1: KACAU (Frames 0 - 90) */}
      <Sequence
        from={TIMING.SCENE_CHAOS.start}
        durationInFrames={TIMING.SCENE_CHAOS.duration}
        name="SceneChaos"
      >
        <SceneChaos />
      </Sequence>

      {/* SCENE 2: HARD CUT (Frames 90 - 135) */}
      <Sequence
        from={TIMING.SCENE_HARD_CUT.start}
        durationInFrames={TIMING.SCENE_HARD_CUT.duration}
        name="SceneHardCut"
      >
        <SceneHardCut />
      </Sequence>

      {/* SCENE 3: RAPI (Frames 135 - 270) */}
      <Sequence
        from={TIMING.SCENE_ORGANIZED.start}
        durationInFrames={TIMING.SCENE_ORGANIZED.duration}
        name="SceneOrganized"
      >
        <SceneOrganized />
      </Sequence>

      {/* SCENE 4: HASIL (Frames 270 - 360) */}
      <Sequence
        from={TIMING.SCENE_OUTCOME.start}
        durationInFrames={TIMING.SCENE_OUTCOME.duration}
        name="SceneOutcome"
      >
        <SceneOutcome />
      </Sequence>

      {/* Bottom TikTok Sound / Brand Footer */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 text-center font-mono text-xs text-white/50">
        ngampus.site • 100% Gratis Selamanya
      </div>
    </div>
  );
};

