"use client";

import { motion, type Variants } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useEffect } from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

const overlayVariants: Variants = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,

    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

export default function MenuOverlay({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const categories = ["Clothing", "Accessories", "Shoes", "Bags"];
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.div
      className={`fixed z-30 top-0 left-0 right-0 w-full h-screen pr-1
    ${isAdminPage ? "pl-1 lg:pl-9 " : "pl-1 "} bg-accent`}
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* HEADER CONTENT */}
      <div className=" jojo-main-wrapper-top h-full w-full flex flex-col lg:flex-row ">
        <motion.div
          className="h-auto w-full  lg:w-1/2   flex flex-col  jojo-container-padding space-y-6"
          variants={sectionVariants}
        >
          <div className="grid w-full  items-center   text-xs  px-3">
            <Input
              className=" "
              id="text"
              type="text"
              placeholder="Search JOJO STUDIO..."
            />
          </div>
          <nav>
            <motion.ul
              className="flex flex-col  text-sm font-mono"
              variants={listVariants}
            >
              {[
                { label: "Products", href: "/" },
                { label: "Visit The Store", href: "/" },
                { label: "About JOJO", href: "/pages/about" },
                { label: "Privacy Policy", href: "/pages/privacy-policy" },
                { label: "Imprint", href: "/pages/imprint" },
                { label: "Admin", href: "/admin" },
              ].map((item) => (
                <motion.li key={item.label} variants={itemVariants}>
                  <Link href={item.href} onClick={() => setOpen(false)}>
                    <Button variant="link" size="sm">
                      {item.label}
                    </Button>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </nav>
        </motion.div>
        <motion.div
          className=" w-full h-full lg:h-screen lg:w-1/2 bg-accent text-accent-foreground flex flex-col jojo-container-padding space-y-6"
          variants={sectionVariants}
        >
          <div className="">
            <Button variant="link" size="sm" className="">
              Latest Added
            </Button>
          </div>

          {/* Categories */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4  gap-0"
            variants={listVariants}
          >
            {categories.map((category) => (
              <motion.div className="" key={category} variants={itemVariants}>
                <Button variant="link" size="sm">
                  {category}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
