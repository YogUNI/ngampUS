import { Composition } from "remotion";
import { HeroStory } from "./HeroStory";
import { FPS, TOTAL } from "./timing";

export const Root = () => (
  <>
    <Composition id="HeroStory" component={HeroStory} durationInFrames={TOTAL} fps={FPS} width={1080} height={1350} />
    <Composition id="HeroStoryVertical" component={HeroStory} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
  </>
);
