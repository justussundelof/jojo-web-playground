"use client";

import { motion, type Variants } from "framer-motion";
import { Button } from "../ui/button";
import { useSite } from "@/context/SiteContext";

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
  return (
    <>
      {currentSite === "neutral" && (
        <motion.section
          className={`
      w-full h-screen pt-9 px-1 pb-1 grid grid-cols-1 lg:grid-cols-2 grid-rows-2 lg:grid-rows-1 `}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className=" col-span-1 row-span-1    flex flex-col bg-[url(/flowers.png)] bg-no-repeat bg-fill bg-center w-full  h-full "
            variants={columnVariants}
          >
            <div className=" w-full h-full relative z-10 flex flex-col items-center justify-center ">
              <button
                onClick={() => setCurrentSite("sale")}
                className={`h-9  font-display font-medium text-2xl px-2 whitespace-nowrap pb-1     border-2 border-background text-background flex items-center pt-0.5  hover:text-background hover:bg-secondary hover:border-secondary transition-all cursor-pointer`}
              >
                For Sale
              </button>
            </div>
          </motion.div>
          <motion.div
            className=" col-span-1 row-span-1  z-0 flex flex-col bg-[url(/cicciolina_noise.png)] bg-no-repeat bg-fill bg-center w-full h-full   "
            variants={columnVariants}
          >
            <div className="w-full h-full relative z-10 flex flex-col items-center justify-center ">
              <button
                onClick={() => setCurrentSite("sale")}
                className={`h-9  font-display font-medium text-2xl px-2 whitespace-nowrap pb-1     border-2 border-background text-background flex items-center pt-0.5  hover:text-background hover:bg-secondary hover:border-secondary transition-all cursor-pointer`}
              >
                For Rent
              </button>
            </div>
          </motion.div>
        </motion.section>
      )}
    </>
  );
}
