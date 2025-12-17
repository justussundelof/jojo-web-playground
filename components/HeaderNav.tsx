"use client";

import { Button } from "./ui/button";
import { useSite } from "@/context/SiteContext";
import { useState, useEffect } from "react";

import Link from "next/link";
import ThemeSwitch from "./ThemeSwitch";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Login from "./Login";
import MenuOverlay from "./MenuOverlay";
import { usePathname } from "next/navigation";

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

export default function HeaderNav() {
  const { currentSite, toggleSite } = useSite();
  const [open, setOpen] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [admin, setAdmin] = useState(false);

  const ifAdmin = usePathname().startsWith("/admin");

  useEffect(() => {
    setAdmin(ifAdmin);
  }, [ifAdmin]);

  return (
    <>
      {/* TOP PART OF HEADER */}
      <header
        className={` ${
          admin ? "left-0 lg:left-14 bg-secondary" : "left-0 bg-background"
        } fixed z-40 top-0  right-0 w-full h-8`}
      >
        <span className="flex justify-between items-center w-full ">
          <Link href="/">
            <h1 className="text-sm tracking-wider font-serif-display flex items-center justify-center  px-3 leading-tight    ">
              JOJO STUDIO
            </h1>
          </Link>

          <motion.div
            variants={headerVariants}
            initial="hidden"
            animate="visible"
            className="flex justify-end 
           "
          >
            <motion.div variants={headerItemVariants}>
              <Button
                variant="link"
                size="sm"
                className=""
                onClick={toggleSite}
              >
                <span className={` `}>
                  {currentSite === "sale" ? "For Rent" : "For Sale"}
                </span>{" "}
                /{" "}
                <span className=" transition-colors line-through opacity-30">
                  {" "}
                  {currentSite === "sale" ? "Sale" : "Rent"}
                </span>
              </Button>
            </motion.div>
            <span className="hidden lg:block">
              <motion.div variants={headerItemVariants}>
                <ThemeSwitch />
              </motion.div>
            </span>

            <motion.div variants={headerItemVariants}>
              <Button
                onClick={() => setOpenLogin(!openLogin)}
                variant="link"
                size="sm"
              >
                Log In
              </Button>
            </motion.div>
            <motion.div variants={headerItemVariants}>
              <Button variant="link" size="sm" className="">
                Cart
              </Button>
            </motion.div>

            <motion.div variants={headerItemVariants}>
              <Button onClick={() => setOpen(!open)} variant="link" size="sm">
                Menu
              </Button>
            </motion.div>
          </motion.div>
        </span>
      </header>

      <AnimatePresence>
        {open && <MenuOverlay open={open} setOpen={setOpen} />}
      </AnimatePresence>

      <AnimatePresence>
        {openLogin && (
          <Login openLogin={openLogin} setOpenLogin={setOpenLogin} />
        )}
      </AnimatePresence>
    </>
  );
}
