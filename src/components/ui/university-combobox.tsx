"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import universitiesData from "@/data/indonesian-universities.json";
import { Search, Building2, Check, ChevronDown, Plus, X } from "lucide-react";

export interface UniversityItem {
  name: string;
  acronym?: string;
  type?: string;
  city?: string;
}

interface UniversityComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  dark?: boolean;
}

export function UniversityCombobox({
  value,
  onChange,
  placeholder = "Pilih / Cari Universitas...",
  disabled = false,
  className = "",
  inputClassName = "",
  dark = false,
}: UniversityComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filtered universities based on search query
  const filteredUniversities = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) {
      return (universitiesData as UniversityItem[]).slice(0, 20);
    }

    return (universitiesData as UniversityItem[])
      .filter((u) => {
        const nameMatch = u.name.toLowerCase().includes(q);
        const acronymMatch = u.acronym
          ? u.acronym.toLowerCase().includes(q)
          : false;
        const cityMatch = u.city ? u.city.toLowerCase().includes(q) : false;
        return nameMatch || acronymMatch || cityMatch;
      })
      .slice(0, 30);
  }, [searchTerm]);

  const handleSelect = (univName: string) => {
    onChange(univName);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleCustomSubmit = () => {
    if (searchTerm.trim()) {
      onChange(searchTerm.trim());
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  const isCustomTermExactMatch = filteredUniversities.some(
    (u) => u.name.toLowerCase() === searchTerm.trim().toLowerCase()
  );

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button / Display */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 80);
            }
          }
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            setIsOpen((prev) => !prev);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 80);
            }
          }
        }}
        className={`flex items-center justify-between gap-2 cursor-pointer transition select-none ${
          inputClassName
            ? inputClassName
            : dark
            ? "w-full rounded-lg border border-[#1b4330] bg-[#0b2419] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#0e2f21] focus:border-[#c8ef70]"
            : "w-full rounded-xl border border-[#d8e3da] bg-[#fafbfa] px-3 py-2 text-xs font-semibold text-[#10261b] hover:bg-white focus:border-[#0f6849]"
        } ${disabled ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
      >
        <span
          title={value || placeholder}
          className={`truncate ${
            !value
              ? dark
                ? "text-[#4d705f] font-normal"
                : "text-[#99a89d] font-normal"
              : dark
              ? "text-white font-semibold"
              : "text-[#10261b] font-semibold"
          }`}
        >
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              role="button"
              onClick={handleClear}
              className={`p-0.5 rounded-full transition ${
                dark
                  ? "hover:bg-white/10 text-[#648c79] hover:text-white"
                  : "hover:bg-black/5 text-[#8b9d91] hover:text-[#10261b]"
              }`}
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown
            size={13}
            className={`shrink-0 transition-transform ${
              dark ? "text-[#648c79]" : "text-[#8b9d91]"
            } ${isOpen ? (dark ? "rotate-180 text-[#c8ef70]" : "rotate-180 text-[#0f6849]") : ""}`}
          />
        </div>
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 z-50 w-[min(380px,92vw)] sm:w-[380px] max-w-[calc(100vw-2rem)] flex flex-col overflow-hidden rounded-2xl border ${
            dark
              ? "border-[#1b4532] bg-[#0c2419] shadow-[0_24px_50px_rgba(0,0,0,0.65)]"
              : "border-[#cbe0d3] bg-[#ffffff] shadow-[0_20px_48px_rgba(16,38,27,0.24)]"
          }`}
        >
          {/* Search Box Header */}
          <div
            className={`p-2.5 border-b ${
              dark
                ? "border-[#1b4330] bg-[#071911]"
                : "border-[#e8f0ea] bg-[#f7faf8]"
            }`}
          >
            <div className="relative flex items-center">
              <Search
                size={14}
                className={`absolute left-3 pointer-events-none ${
                  dark ? "text-[#c8ef70]" : "text-[#0f6849]"
                }`}
              />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (filteredUniversities.length > 0) {
                      handleSelect(filteredUniversities[0].name);
                    } else {
                      handleCustomSubmit();
                    }
                  } else if (e.key === "Escape") {
                    setIsOpen(false);
                  }
                }}
                placeholder="Cari nama kampus atau singkatan (UI, UMB, UGM)..."
                className={`w-full rounded-xl border py-2 pl-9 pr-8 text-xs font-bold outline-none transition ${
                  dark
                    ? "border-[#1b4330] bg-[#0b2419] text-white placeholder:text-[#4d705f] focus:border-[#c8ef70] focus:ring-2 focus:ring-[#c8ef70]/20"
                    : "border-[#c4ded0] bg-white text-[#10261b] placeholder:text-[#8ba294] focus:border-[#0f6849] focus:ring-2 focus:ring-[#0f6849]/20"
                }`}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className={`absolute right-2.5 transition ${
                    dark
                      ? "text-[#648c79] hover:text-white"
                      : "text-[#768e7f] hover:text-[#10261b]"
                  }`}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* List options */}
          <div
            className={`flex-1 overflow-y-auto p-1.5 space-y-1 max-h-60 ${
              dark
                ? "divide-y divide-[#133525] bg-[#0c2419]"
                : "divide-y divide-[#f0f5f2] bg-[#ffffff]"
            }`}
          >
            {filteredUniversities.length === 0 ? (
              <div className="p-4 text-center">
                <p
                  className={`text-xs font-medium ${
                    dark ? "text-[#8caea0]" : "text-[#52665a]"
                  }`}
                >
                  Kampus &quot;{searchTerm}&quot; tidak ada dalam daftar standar.
                </p>
                {searchTerm.trim() && (
                  <button
                    type="button"
                    onClick={handleCustomSubmit}
                    className={`mt-2.5 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer shadow-xs ${
                      dark
                        ? "bg-[#c8ef70] text-[#091a12] hover:bg-[#d5fa80]"
                        : "bg-[#0f6849] text-white hover:bg-[#103626]"
                    }`}
                  >
                    <Plus size={13} />
                    <span>Gunakan nama kustom: &quot;{searchTerm.trim()}&quot;</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                {filteredUniversities.map((univ) => {
                  const isSelected =
                    value?.toLowerCase() === univ.name.toLowerCase();
                  return (
                    <button
                      key={univ.name}
                      type="button"
                      onClick={() => handleSelect(univ.name)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl p-2.5 text-left transition cursor-pointer ${
                        isSelected
                          ? dark
                            ? "bg-[#c8ef70] text-[#091a12] font-black shadow-xs"
                            : "bg-[#0f6849] text-white font-bold shadow-xs"
                          : dark
                          ? "text-[#d2e7dc] hover:bg-[#113826]"
                          : "text-[#10261b] hover:bg-[#ebf6ee]"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <span
                          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg ${
                            isSelected
                              ? dark
                                ? "bg-[#091a12]/20 text-[#091a12]"
                                : "bg-white/20 text-[#c8ef70]"
                              : dark
                              ? "bg-[#071911] text-[#c8ef70]"
                              : "bg-[#eaf5ee] text-[#0f6849]"
                          }`}
                        >
                          <Building2 size={13} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <span
                            className={`block text-xs font-bold leading-tight break-words ${
                              isSelected
                                ? dark
                                  ? "text-[#091a12]"
                                  : "text-white"
                                : dark
                                ? "text-white"
                                : "text-[#10261b]"
                            }`}
                          >
                            {univ.name}
                          </span>
                          {(univ.acronym || univ.type || univ.city) && (
                            <div
                              className={`mt-0.5 flex flex-wrap items-center gap-1 text-[10.5px] ${
                                isSelected
                                  ? dark
                                    ? "text-[#091a12]/80"
                                    : "text-white/80"
                                  : dark
                                  ? "text-[#7ea390]"
                                  : "text-[#587262]"
                              }`}
                            >
                              {univ.acronym && (
                                <span className="font-extrabold uppercase tracking-wide">
                                  {univ.acronym}
                                </span>
                              )}
                              {univ.type && (
                                <>
                                  <span>•</span>
                                  <span>{univ.type}</span>
                                </>
                              )}
                              {univ.city && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[150px]">{univ.city}</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <Check
                          size={16}
                          className={`shrink-0 ${
                            dark ? "text-[#091a12]" : "text-[#c8ef70]"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}

                {/* Custom fallback entry */}
                {searchTerm.trim() && !isCustomTermExactMatch && (
                  <div className="pt-1.5">
                    <button
                      type="button"
                      onClick={handleCustomSubmit}
                      className={`flex w-full items-center gap-2 rounded-xl p-2 text-xs transition cursor-pointer font-bold ${
                        dark
                          ? "text-[#c8ef70] hover:bg-[#113826]"
                          : "text-[#0f6849] hover:bg-[#eaf5ee]"
                      }`}
                    >
                      <Plus size={14} className="shrink-0" />
                      <span className="truncate">
                        Pakai teks ini: &quot;{searchTerm.trim()}&quot;
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
