"use client";

import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect } from "react";

interface LoaderJoJoProps {
  loading: boolean;
}

export default function LoaderJoJo({ loading }: LoaderJoJoProps) {
  const progress = useMotionValue(0);

  useEffect(() => {
    if (loading) {
      progress.set(0.1);

      const controls = animate(progress, 0.9, {
        duration: 1.2,
        ease: "linear",
      });

      return () => {
        controls.stop();
      };
    } else {
      animate(progress, 1, {
        duration: 0.25,
        ease: "easeOut",
      });
    }
  }, [loading, progress]);

  return (
    <motion.div
      className="mx-1   pointer-events-none sticky z-40 top-0 left-0  h-1 origin-left"
      style={{
        scaleX: progress,
        backgroundColor: loading ? "var(--accent)" : "var(--secondary)",
      }}
    />
  );
}
