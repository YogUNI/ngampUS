import React from "react";
import { TIMING } from "../timing";

interface PhoneFrameProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  scale?: number;
  translateY?: number;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  width = 640,
  height = 1100,
  scale = 1,
  translateY = 0,
}) => {
  return (
    <div
      style={{
        width,
        height,
        scale,
        translate: `0px ${translateY}px`,
        backgroundColor: TIMING.COLORS.bgDark,
        borderColor: "rgba(255, 255, 255, 0.16)",
        boxShadow: "0 40px 100px -20px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)",
      }}
      className="relative flex flex-col overflow-hidden rounded-[52px] border-[6px]"
    >
      {/* Phone Top Notch / Speaker & Camera Pill */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
        <div className="h-4.5 w-28 rounded-full bg-black/90 flex items-center justify-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#10261b]" />
          <div className="h-1.5 w-8 rounded-full bg-white/10" />
        </div>
      </div>

      {/* Status Bar */}
      <div className="relative z-40 flex items-center justify-between px-8 pt-4 pb-2 text-[15px] font-mono font-bold text-white/70">
        <span>08:00</span>
        <div className="flex items-center gap-2 text-xs">
          <span>5G</span>
          <div className="h-2.5 w-5 rounded-xs border border-white/50 p-0.5">
            <div className="h-full w-3/4 rounded-2xs bg-white" />
          </div>
        </div>
      </div>

      {/* Screen Content Container */}
      <div className="relative flex-1 overflow-hidden px-5 pb-6">
        {children}
      </div>

      {/* Home Indicator Bar */}
      <div className="relative z-40 flex justify-center pb-2.5 pt-1">
        <div className="h-1 w-32 rounded-full bg-white/30" />
      </div>
    </div>
  );
};

