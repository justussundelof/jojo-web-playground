"use client";

import { Button } from "./ui/button";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  GearIcon,
  HomeIcon,
  PersonIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";
import AdminDashboard from "./AdminDashboard";

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
  const [openDashboard, setOpenDashboard] = useState(true);
  return (
    <>
      <motion.header
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        className="fixed bottom-0 right-0 lg:top-0 left-auto lg:left-0 lg:right-auto  z-40  bg-transparent lg:bg-secondary w-full lg:w-9 h-24 lg:h-screen p-4 "
      >
        <motion.div
          variants={sidebarItemVariants}
          className="bg-secondary lg:bg-transparent relative  lg:pt-[20vh] grid grid-cols-3  lg:flex  items-center justify-between lg:flex-col-reverse  lg:justify-between lg:items-center  w-sm lg:w-auto h-full  lg:pb-[10vh] p-4 lg:p-0 "
        >
          <span className="flex flex-row justify-center lg:flex-col lg:justify-center lg:items-end">
            <Button variant="secondary" size="icon" className="">
              <GearIcon />
            </Button>
          </span>
          <span className="flex flex-row justify-center lg:flex-col lg:justify-center lg:items-end">
            <Button variant="secondary" size="icon" className="">
              <PersonIcon />
            </Button>
          </span>
          <span className="flex flex-row justify-center lg:flex-col lg:justify-center lg:items-end">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setOpenDashboard(true)}
              className=""
            >
              <PlusIcon />
            </Button>
          </span>
        </motion.div>
      </motion.header>

      <AnimatePresence>{openDashboard && <AdminDashboard />}</AnimatePresence>
    </>
  );
}
