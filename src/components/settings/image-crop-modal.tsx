"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Check,
  X,
  Crop,
  RefreshCw,
  Square,
  RectangleHorizontal,
  RectangleVertical,
} from "lucide-react";

export type AspectRatioMode = "square" | "landscape" | "portrait";

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onSave: (croppedDataUrl: string) => void;
  title?: string;
  subtitle?: string;
  shape?: "circle" | "rounded-rect";
  allowAspectRatioChange?: boolean;
  defaultAspectRatio?: AspectRatioMode;
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onSave,
  title = "Sesuaikan Foto",
  subtitle = "Geser posisi, atur zoom, dan putar foto sesuai keinginanmu.",
  shape = "circle",
  allowAspectRatioChange = false,
  defaultAspectRatio = "square",
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>(defaultAspectRatio);
  const [fitMode, setFitMode] = useState<"cover" | "contain">("contain");
  const [bgColor, setBgColor] = useState<"white" | "transparent">("white");
  const [mounted, setMounted] = useState(false);

  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state whenever new image is loaded or modal opened
  useEffect(() => {
    if (imageSrc && isOpen) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setAspectRatio(defaultAspectRatio);
      setFitMode("contain");
    }
  }, [imageSrc, isOpen, defaultAspectRatio]);

  // Dragging handlers for mouse & touch
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Dimensions based on aspect ratio
  // Standard bounding box in UI: max width ~280px, max height ~280px
  let viewportWidth = 260;
  let viewportHeight = 260;

  if (aspectRatio === "landscape") {
    viewportWidth = 280;
    viewportHeight = 190;
  } else if (aspectRatio === "portrait") {
    viewportWidth = 200;
    viewportHeight = 270;
  }

  // Export to DataURL
  const handleApplyCrop = () => {
    if (!imageRef.current) return;
    const canvas = document.createElement("canvas");

    // High quality export size
    const maxOutputDim = 400;
    let outputWidth = maxOutputDim;
    let outputHeight = maxOutputDim;

    if (aspectRatio === "landscape") {
      outputWidth = 450;
      outputHeight = 300;
    } else if (aspectRatio === "portrait") {
      outputWidth = 300;
      outputHeight = 400;
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (bgColor === "white") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outputWidth, outputHeight);
    } else {
      ctx.clearRect(0, 0, outputWidth, outputHeight);
    }

    const scaleFactorX = outputWidth / viewportWidth;
    const scaleFactorY = outputHeight / viewportHeight;

    ctx.save();
    // Center canvas context
    ctx.translate(outputWidth / 2, outputHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(
      position.x * scaleFactorX * (1 / zoom),
      position.y * scaleFactorY * (1 / zoom)
    );

    const img = imageRef.current;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const boxAspect = outputWidth / outputHeight;

    let drawWidth = outputWidth;
    let drawHeight = outputHeight;

    if (fitMode === "cover") {
      // Cover: fill the box, clipping edges
      if (imgAspect > boxAspect) {
        drawHeight = outputHeight;
        drawWidth = outputHeight * imgAspect;
      } else {
        drawWidth = outputWidth;
        drawHeight = outputWidth / imgAspect;
      }
    } else {
      // Contain: fit entirely within the box without clipping
      if (imgAspect > boxAspect) {
        drawWidth = outputWidth;
        drawHeight = outputWidth / imgAspect;
      } else {
        drawHeight = outputHeight;
        drawWidth = outputHeight * imgAspect;
      }
    }

    ctx.drawImage(
      img,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );
    ctx.restore();

    // Use WebP with fallback to PNG for transparency or JPEG for white bg
    const mime = bgColor === "transparent" ? "image/png" : "image/webp";
    const quality = 0.9;
    const dataUrl = canvas.toDataURL(mime, quality);
    onSave(dataUrl);
    onClose();
  };

  if (!isOpen || !imageSrc || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-[#d8e2da] bg-white p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#e5ece6] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#dff3e5] text-[var(--brand)]">
              <Crop size={18} />
            </span>
            <div>
              <h3 className="font-display text-lg font-black text-[#103626]">
                {title}
              </h3>
              <p className="text-xs text-[var(--muted)]">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[var(--muted)] hover:bg-[#f2f6f2] hover:text-[#103626] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Aspect Ratio Selector (Optional / Organization Logo) */}
        {allowAspectRatioChange && (
          <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl bg-[#f4f8f5] p-2 border border-[#d8e2da]">
            <span className="pl-2 text-xs font-bold text-[#103626]">Orientasi:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAspectRatio("square")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  aspectRatio === "square"
                    ? "bg-[var(--brand)] text-white shadow-xs"
                    : "bg-white text-[var(--ink)] hover:bg-[#eef5ef]"
                }`}
              >
                <Square size={13} /> Persegi (1:1)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio("landscape")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  aspectRatio === "landscape"
                    ? "bg-[var(--brand)] text-white shadow-xs"
                    : "bg-white text-[var(--ink)] hover:bg-[#eef5ef]"
                }`}
              >
                <RectangleHorizontal size={14} /> Landscape
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio("portrait")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  aspectRatio === "portrait"
                    ? "bg-[var(--brand)] text-white shadow-xs"
                    : "bg-white text-[var(--ink)] hover:bg-[#eef5ef]"
                }`}
              >
                <RectangleVertical size={13} /> Portrait
              </button>
            </div>
          </div>
        )}

        {/* Crop Viewport & Canvas Area */}
        <div className="mt-5 flex flex-col items-center">
          <div
            className={`relative cursor-grab active:cursor-grabbing select-none overflow-hidden border-4 border-[var(--brand)] shadow-inner transition-all duration-200 ${
              shape === "circle" && aspectRatio === "square"
                ? "rounded-full"
                : "rounded-3xl"
            } ${bgColor === "white" ? "bg-white" : "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px]"}`}
            style={{
              width: `${viewportWidth}px`,
              height: `${viewportHeight}px`,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Guide overlay */}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 z-20">
              <div className="border-r border-b border-[#103626]" />
              <div className="border-r border-b border-[#103626]" />
              <div className="border-b border-[#103626]" />
              <div className="border-r border-b border-[#103626]" />
              <div className="border-r border-b border-[#103626]" />
              <div className="border-b border-[#103626]" />
              <div className="border-r border-[#103626]" />
              <div className="border-r border-[#103626]" />
              <div />
            </div>

            {/* Target Image Preview */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              draggable={false}
              className="absolute left-1/2 top-1/2 max-w-none origin-center pointer-events-none transition-transform duration-75 select-none"
              style={{
                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                width: `${viewportWidth}px`,
                height: `${viewportHeight}px`,
                objectFit: fitMode,
              }}
            />
          </div>

          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-[var(--muted)] font-medium">
            <Move size={13} className="text-[var(--brand)]" />
            Klik & geser logo di dalam area untuk menyesuaikan posisi
          </p>
        </div>

        {/* Adjust Controls: Zoom, Fit, Rotate, Reset */}
        <div className="mt-4 space-y-3 rounded-2xl bg-[#f7faf6] p-4 border border-[#e2ece3]">
          
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomOut size={16} className="text-[var(--muted)] shrink-0" />
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-[var(--brand)] cursor-pointer h-2 bg-[#d7e3da] rounded-lg appearance-none"
            />
            <ZoomIn size={16} className="text-[var(--brand)] shrink-0" />
            <span className="w-12 text-right font-mono text-xs font-bold text-[#103626]">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Quick Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e2ece3] pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFitMode((m) => (m === "contain" ? "cover" : "contain"))}
                className="flex items-center gap-1.5 rounded-xl border border-[#d8e2da] bg-white px-3 py-1.5 text-xs font-bold text-[#103626] hover:bg-[#eaf5eb] transition active:scale-95"
                title="Sesuaikan ukuran penuh atau paskan ke kotak"
              >
                {fitMode === "contain" ? "Paskan Logo (Fit)" : "Penuh (Fill)"}
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="flex items-center gap-1.5 rounded-xl border border-[#d8e2da] bg-white px-3 py-1.5 text-xs font-bold text-[#103626] hover:bg-[#eaf5eb] transition active:scale-95"
              >
                <RotateCw size={13} /> Putar 90°
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setRotation(0);
                  setPosition({ x: 0, y: 0 });
                }}
                className="flex items-center gap-1.5 rounded-xl border border-[#d8e2da] bg-white px-3 py-1.5 text-xs font-bold text-[var(--muted)] hover:bg-[#eaf5eb] hover:text-[#103626] transition active:scale-95"
              >
                <RefreshCw size={13} /> Reset
              </button>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-[var(--muted)] mr-1">Latar:</span>
              <button
                type="button"
                onClick={() => setBgColor("white")}
                className={`rounded-lg px-2 py-1 text-[11px] font-bold border transition ${
                  bgColor === "white"
                    ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-dark)]"
                    : "border-transparent bg-white text-[var(--muted)] hover:text-black"
                }`}
              >
                Putih
              </button>
              <button
                type="button"
                onClick={() => setBgColor("transparent")}
                className={`rounded-lg px-2 py-1 text-[11px] font-bold border transition ${
                  bgColor === "transparent"
                    ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-dark)]"
                    : "border-transparent bg-white text-[var(--muted)] hover:text-black"
                }`}
              >
                Transparan
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#d8e2da] px-5 py-2.5 text-sm font-bold text-[var(--muted)] hover:bg-[#f5f8f5] hover:text-[#103626] transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="flex items-center gap-2 rounded-2xl bg-[var(--brand)] px-6 py-2.5 text-sm font-black text-white shadow-md shadow-[#0f6849]/20 hover:bg-[var(--brand-dark)] transition active:scale-95"
          >
            <Check size={16} /> Terapkan Logo
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
