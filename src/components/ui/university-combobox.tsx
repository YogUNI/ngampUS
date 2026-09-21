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
  dropdownAlign?: "left" | "right" | "auto";
}

export function UniversityCombobox({
  value,
  onChange,
  placeholder = "Pilih / Cari Universitas...",
  disabled = false,
  className = "",
  inputClassName = "",
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
      // Show top universities by default
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
          inputClassName ||
          "w-full rounded-xl border border-[#d8e3da] bg-[#fafbfa] px-3 py-2 text-xs font-semibold text-[#10261b] hover:bg-white focus:border-[#0f6849]"
        } ${disabled ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
      >
        <span
          title={value || placeholder}
          className={`truncate ${!value ? "text-[#99a89d] font-normal" : "text-[#10261b] dark:text-[#f0f7f2] font-semibold"}`}
        >
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              role="button"
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#8b9d91] hover:text-[#10261b] transition"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown
            size={14}
            className={`shrink-0 transition-transform text-[#8b9d91] ${isOpen ? "rotate-180 text-[#0f6849]" : ""}`}
          />
        </div>
      </div>

      {/* Popover Dropdown - responsive full-bleed width with min 320px to prevent text clipping */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-[min(380px,92vw)] sm:w-[380px] max-w-[calc(100vw-2rem)] flex flex-col overflow-hidden rounded-2xl border border-[#d5dfd6] dark:border-[#22392c] bg-white dark:bg-[#112117] shadow-[0_16px_40px_rgba(16,38,27,0.22)]">
          {/* Search Box Header */}
          <div className="p-2.5 border-b border-[#eef4f0] dark:border-[#1a3324] bg-[#f8faf8] dark:bg-[#0d1a12]">
            <div className="relative flex items-center">
              <Search
                size={14}
                className="absolute left-3 text-[#0f6849] dark:text-[#22c55e] pointer-events-none"
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
                className="w-full rounded-xl border border-[#cdddd1] dark:border-[#2b4b37] bg-white dark:bg-[#15271d] py-2 pl-9 pr-8 text-xs font-semibold text-[#10261b] dark:text-white placeholder:text-[#8b9d91] dark:placeholder:text-[#6a8775] outline-none focus:border-[#0f6849] focus:ring-2 focus:ring-[#0f6849]/20"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 text-[#8b9d91] hover:text-[#10261b] dark:hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* List options */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1 max-h-64 divide-y divide-[#f2f6f3] dark:divide-[#182d20]">
            {filteredUniversities.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-[#6e8275] dark:text-[#8ea295]">
                  Kampus &quot;{searchTerm}&quot; tidak ada dalam daftar standar.
                </p>
                {searchTerm.trim() && (
                  <button
                    type="button"
                    onClick={handleCustomSubmit}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-[#0f6849] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#103626] transition cursor-pointer shadow-xs"
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
                          ? "bg-[#0f6849] text-white font-bold shadow-xs"
                          : "text-[#10261b] dark:text-[#e4efe8] hover:bg-[#ebf6ee] dark:hover:bg-[#192f22]"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <span
                          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg ${
                            isSelected
                              ? "bg-white/20 text-[#c8ef70]"
                              : "bg-[#eaf5ee] dark:bg-[#162e20] text-[#0f6849] dark:text-[#22c55e]"
                          }`}
                        >
                          <Building2 size={13} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-bold leading-tight break-words">
                            {univ.name}
                          </span>
                          {(univ.acronym || univ.type || univ.city) && (
                            <div
                              className={`mt-0.5 flex flex-wrap items-center gap-1 text-[10.5px] ${
                                isSelected
                                  ? "text-white/80"
                                  : "text-[#657a6c] dark:text-[#8ea496]"
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
                        <Check size={16} className="shrink-0 text-[#c8ef70]" />
                      )}
                    </button>
                  );
                })}

                {/* Optional Fallback if user wants custom name even if list has matches */}
                {searchTerm.trim() && !isCustomTermExactMatch && (
                  <div className="pt-1.5">
                    <button
                      type="button"
                      onClick={handleCustomSubmit}
                      className="flex w-full items-center gap-2 rounded-xl p-2 text-xs text-[#0f6849] dark:text-[#22c55e] hover:bg-[#eaf5ee] dark:hover:bg-[#192f22] transition cursor-pointer font-bold"
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
