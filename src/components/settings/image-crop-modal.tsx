"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  UploadCloud,
  Check,
  X,
  Sparkles,
  Crop,
  RefreshCw,
} from "lucide-react";

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onSave: (croppedDataUrl: string) => void;
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onSave,
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state whenever new image is loaded
  useEffect(() => {
    if (imageSrc) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [imageSrc]);

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

  // Crop & Export to DataURL
  const handleApplyCrop = () => {
    if (!imageRef.current) return;
    const canvas = document.createElement("canvas");
    const outputSize = 400; // standard 400x400 output
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Viewport preview box is 260px in UI
    const previewBoxSize = 260;
    const scaleFactor = outputSize / previewBoxSize;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outputSize, outputSize);

    ctx.save();
    // Center canvas context
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(
      position.x * scaleFactor * (1 / zoom),
      position.y * scaleFactor * (1 / zoom)
    );

    const img = imageRef.current;
    // Calculate aspect fit inside preview
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawWidth = outputSize;
    let drawHeight = outputSize;

    if (imgAspect > 1) {
      drawWidth = outputSize * imgAspect;
      drawHeight = outputSize;
    } else {
      drawWidth = outputSize;
      drawHeight = outputSize / imgAspect;
    }

    ctx.drawImage(
      img,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    onSave(dataUrl);
    onClose();
  };

  if (!isOpen || !imageSrc || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-[#d8e2da] bg-white p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#e5ece6] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#dff3e5] text-[var(--brand)]">
              <Crop size={18} />
            </span>
            <div>
              <h3 className="font-display text-lg font-black text-[#103626]">
                Sesuaikan Foto Profil
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Geser posisi, atur zoom, dan putar foto sesuai keinginanmu.
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

        {/* Crop Viewport & Canvas Area */}
        <div className="mt-5 flex flex-col items-center">
          <div
            className="relative h-[260px] w-[260px] cursor-grab active:cursor-grabbing select-none overflow-hidden rounded-full border-4 border-[var(--brand)] bg-[#103626]/5 shadow-inner"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Guide overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/30" />
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-25">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>

            {/* Target Image Preview */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              draggable={false}
              className="absolute left-1/2 top-1/2 max-w-none origin-center pointer-events-none transition-transform duration-75"
              style={{
                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                width: "260px",
                height: "260px",
                objectFit: "contain",
              }}
            />
          </div>

          <p className="mt-2.5 flex items-center gap-1.5 text-xs text-[var(--muted)] font-medium">
            <Move size={13} className="text-[var(--brand)]" />
            Klik & drag foto di dalam lingkaran untuk memindahkan posisi
          </p>
        </div>

        {/* Adjust Controls: Zoom, Rotate, Reset */}
        <div className="mt-5 space-y-3.5 rounded-2xl bg-[#f7faf6] p-4 border border-[#e2ece3]">
          
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomOut size={16} className="text-[var(--muted)] shrink-0" />
            <input
              type="range"
              min="0.8"
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

          {/* Quick Buttons: Rotate & Reset */}
          <div className="flex items-center justify-between border-t border-[#e2ece3] pt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="flex items-center gap-1.5 rounded-xl border border-[#d8e2da] bg-white px-3 py-1.5 text-xs font-bold text-[#103626] hover:bg-[#eaf5eb] transition active:scale-95"
              >
                <RotateCw size={13} />
                Putar 90°
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
                <RefreshCw size={13} />
                Reset
              </button>
            </div>
            <span className="text-[11px] font-semibold text-[var(--brand)]">
              Ratio 1:1 Bulat
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
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
            <Check size={16} />
            Terapkan Foto
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
