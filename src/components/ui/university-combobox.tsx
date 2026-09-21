"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import universitiesData from "@/data/indonesian-universities.json";
import { Search, Building2, Check, ChevronDown, Plus } from "lucide-react";

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
      // Prioritize prominent universities at the top when blank
      return (universitiesData as UniversityItem[]).slice(0, 15);
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
      .slice(0, 25);
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
              setTimeout(() => inputRef.current?.focus(), 50);
            }
          }
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            setIsOpen((prev) => !prev);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 50);
            }
          }
        }}
        className={`flex items-center justify-between gap-2 cursor-pointer transition select-none ${
          inputClassName ||
          "w-full rounded-xl border border-[#d8e3da] bg-[#fafbfa] px-3.5 py-2 text-xs font-semibold text-[#10261b] hover:bg-white focus:border-[#0f6849]"
        } ${disabled ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
      >
        <span className={`truncate ${!value ? "text-[#99a89d] font-normal" : "text-inherit"}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform text-[#8b9d91] ${isOpen ? "rotate-180 text-[#0f6849]" : ""}`}
        />
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-72 w-full flex flex-col overflow-hidden rounded-2xl border border-[#cbe0d2] bg-white shadow-[0_12px_32px_rgba(16,38,27,0.18)] dark:bg-[#15231b] dark:border-[#22392c]">
          {/* Search Box Header */}
          <div className="p-2 border-b border-[#eef4f0] dark:border-[#22392c] bg-[#f9fcf9] dark:bg-[#121c16]">
            <div className="relative flex items-center">
              <Search
                size={13}
                className="absolute left-2.5 text-[#8b9d91] pointer-events-none"
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
                placeholder="Ketik nama kampus / singkatan (UI, UMB, ITB)..."
                className="w-full rounded-xl border border-[#d8e3da] dark:border-[#2b4436] bg-white dark:bg-[#192a20] py-1.5 pl-8 pr-3 text-xs font-medium text-[#10261b] dark:text-white placeholder:text-[#99a89d] outline-none focus:border-[#0f6849] focus:ring-1 focus:ring-[#0f6849]"
              />
            </div>
          </div>

          {/* List options */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 max-h-56">
            {filteredUniversities.length === 0 ? (
              <div className="p-3 text-center">
                <p className="text-xs text-[#6e8275] dark:text-[#8ea295]">
                  Kampus tidak ditemukan di daftar resmi.
                </p>
                {searchTerm.trim() && (
                  <button
                    type="button"
                    onClick={handleCustomSubmit}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#0f6849] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#103626] transition cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Gunakan &quot;{searchTerm.trim()}&quot;</span>
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
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition cursor-pointer ${
                        isSelected
                          ? "bg-[#0f6849] text-white font-bold shadow-xs"
                          : "text-[#10261b] dark:text-[#d3e5da] hover:bg-[#ebf6ee] dark:hover:bg-[#1c3024] font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Building2
                          size={13}
                          className={`shrink-0 ${
                            isSelected ? "text-[#c8ef70]" : "text-[#0f6849]"
                          }`}
                        />
                        <div className="truncate">
                          <span className="block truncate">{univ.name}</span>
                          {(univ.acronym || univ.type || univ.city) && (
                            <span
                              className={`text-[10px] block truncate ${
                                isSelected
                                  ? "text-white/80"
                                  : "text-[#708477] dark:text-[#889f92]"
                              }`}
                            >
                              {[univ.acronym, univ.type, univ.city]
                                .filter(Boolean)
                                .join(" • ")}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <Check size={14} className="shrink-0 text-[#c8ef70]" />
                      )}
                    </button>
                  );
                })}

                {/* Optional Fallback if user wants custom name even if list has results */}
                {searchTerm.trim() && !isCustomTermExactMatch && (
                  <div className="mt-1 pt-1 border-t border-[#edf4ef] dark:border-[#22392c]">
                    <button
                      type="button"
                      onClick={handleCustomSubmit}
                      className="flex w-full items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs text-[#0f6849] dark:text-[#8ce8a3] hover:bg-[#eaf5ee] dark:hover:bg-[#1b2f23] transition cursor-pointer font-semibold"
                    >
                      <Plus size={13} />
                      <span className="truncate">
                        Pakai nama kustom: &quot;{searchTerm.trim()}&quot;
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
