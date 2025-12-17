"use client";

import { Button } from "./ui/button";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  GearIcon,
  HomeIcon,
  PersonIcon,
  PlusIcon,
} from "@radix-ui/react-icons";

const sidebarVariants: Variants = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,

    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const sidebarItemVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,

    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1], // editorial ease
    },
  },
};

export default function AdminSidebar() {
  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className="fixed top-9 lg:top-0 left-0 right-0 z-40 bg-accent w-full lg:w-9 h-9 lg:h-screen"
    >
      <motion.div
        variants={sidebarItemVariants}
        className="relative pt-0 lg:pt-[20vh]  flex flex-row items-center justify-between lg:flex-col  lg:justify-between lg:items-center w-full h-9 lg:h-full lg:pb-[10vh]"
      >
        <Button variant="ghost" size="sm" className="">
          <PlusIcon />
        </Button>
        <span>
          <Button variant="ghost" size="sm" className="">
            <PersonIcon />
          </Button>
          <Button variant="ghost" size="sm" className="">
            <GearIcon />
          </Button>
        </span>
      </motion.div>
    </motion.header>
  );
}
