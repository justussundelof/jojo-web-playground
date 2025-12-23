"use client";

import { motion, type Variants } from "framer-motion";
import { Button } from "../ui/button";
import { useSite } from "@/context/SiteContext";
import { useEffect, useState } from "react";
import { ArrowDownIcon } from "@radix-ui/react-icons";
import Link from "next/link";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.6,
    },
  },
};

const columnVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,

    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function SiteSelector() {
  const { currentSite, setCurrentSite } = useSite();

  const TARGET_DATE = new Date(2026, 1, 26, 0, 0, 0);

  function getTimeRemaining(target: Date) {
    const total = target.getTime() - Date.now();

    if (total <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds };
  }

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const update = () => {
      setTimeLeft(getTimeRemaining(TARGET_DATE));
    };

    update(); // initial client-only sync

    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {currentSite === "neutral" && (
        <motion.section
          className={`
      w-full h-screen pt-24 px-1 pb-1 flex flex-col lg:flex-row gap-y-1 items-start  justify-end lg:items-end lg:justify-start lg:gap-x-1   `}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="l font-extended font-light text-4xl lg:text-6xl lg:font-thin border-2 px-1.5 pb-0.5"
            variants={columnVariants}
          >
            {timeLeft ? (
              <>
                {timeLeft.days}D {String(timeLeft.hours).padStart(2, "0")}H{" "}
                {String(timeLeft.minutes).padStart(2, "0")}M{" "}
                {String(timeLeft.seconds).padStart(2, "0")}S
              </>
            ) : (
              "--D --H --M --S"
            )}
          </motion.div>

          <motion.div
            onClick={() => setCurrentSite("sale")}
            className=" border-8 border-secondary flex items-end justify-center px-3 bg-secondary pb-1.5 w-full h-64 max-w-md hover:bg-transparent text-background hover:text-secondary transition-all cursor-pointer tracking-normal hover:tracking-tight   "
            variants={columnVariants}
          >
            <h2 className="  text-8xl font-display ">For Sale</h2>
          </motion.div>
          <div className="flex gap-x-1 items-end justify-start lg:items-end lg:justify-start opacity-30 ">
            <motion.div
              className=" flex items-center justify-center  bg-transparent pt-0 pb-1.5 px-1 h-min border-8 border-secondary    "
              variants={columnVariants}
            >
              <h2 className=" px-2  text-secondary text-8xl  font-display uppercase line-throught  font-medium ">
                Rent
              </h2>
            </motion.div>
            <motion.div className="      " variants={columnVariants}>
              <h2 className=" px-1 text-secondary text-2xl  font-display uppercase font-medium ">
                COMING SOON
              </h2>
            </motion.div>
          </div>

          {/* <motion.div className="   " variants={columnVariants}>
            <div className="bg-secondary w-64 aspect-square"></div>
          </motion.div> */}
        </motion.section>
      )}
    </>
  );
}
