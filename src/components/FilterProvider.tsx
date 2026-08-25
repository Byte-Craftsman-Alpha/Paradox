"use client";
import { createContext, useContext, useMemo, useState } from "react";
import type { CapabilityKey } from "@/lib/content";

interface FilterCtx {
  filter: CapabilityKey | null;
  setFilter: (k: CapabilityKey | null) => void;
  filteredProjects: string[];
  filteredMembers: string[];
}

const Ctx = createContext<FilterCtx | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filter, setFilter] = useState<CapabilityKey | null>(null);
  const value = useMemo<FilterCtx>(() => ({ filter, setFilter, filteredProjects: [], filteredMembers: [] }), [filter]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFilter(): FilterCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useFilter must be used inside <FilterProvider>");
  return v;
}