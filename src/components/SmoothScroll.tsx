"use client";
import { useEffect } from "react";
import { setupScroll } from "@/lib/scroll";

export function SmoothScroll() {
  useEffect(() => {
    const { destroy } = setupScroll();
    return () => {
      destroy();
    };
  }, []);

  return null;
}

