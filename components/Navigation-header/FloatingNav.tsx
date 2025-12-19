"use client";

import { useSite } from "@/context/SiteContext";
import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";

const { toggleSite, currentSite } = useSite();

const headerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const headerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -12,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1], // editorial ease
    },
  },
};

export default function FloatingNav() {
  return (
    <div className="fixed top-0 left-0 z-50 ">
      <div className="flex flex-col items-center justify-center h-full bg-background w-xs">
        <motion.div variants={headerItemVariants}>
          <div
            role="button"
            className="flex justify-start space-x-1 "
            onClick={toggleSite}
          >
            <button
              className={`h-9  font-display font-medium text-2xl px-2 whitespace-nowrap pb-1 ${
                currentSite === "sale"
                  ? "bg-secondary"
                  : "bg-transparent text-secondary border border-secondary"
              }  text-background`}
            >
              {currentSite === "sale" ? "For Rent" : "For Sale"}
            </button>
            <button className=" font-mono text-xs font-normal transition-colors line-through  h-9 border px-2 flex items-end pb-1 text-secondary border-secondary">
              {currentSite === "sale" ? "SALE" : "RENT"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
