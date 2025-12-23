"use client";

import { motion, type Variants } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useEffect, useMemo, useState } from "react";
import { Cross1Icon } from "@radix-ui/react-icons";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSite } from "@/context/SiteContext";

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
  toggleOpenMenu,
  navItems,
  handleLogout,
  isLoggingOut,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleOpenMenu: () => void;
  navItems: { label: string; href: string }[];
  handleLogout: () => void;
  isLoggingOut: boolean;
}) {
  const categories = ["Clothing", "Accessories", "Shoes", "Bags"];
  const pathname = usePathname();
  const router = useRouter();
  const isAdminPage = pathname.startsWith("/admin");
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  const { currentSite, toggleSite } = useSite();

  // Build navigation items based on user authentication and role

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.div
        className={`fixed z-50 top-0 left-0 right-0 w-md lg:w-1/2 h-screen flex flex-col pr-1
    ${isAdminPage ? "pl-0 lg:pl-9 " : "pl-0 "} bg-secondary`}
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="absolute top-0 right-0 p-4 w-full flex justify-between space-x-1">
          <motion.div className="" variants={sectionVariants}>
            <Button
              variant="secondary"
              size="icon"
              className="
         bg-transparent border-transparent text-background hover:bg-secondary hover:text-accent   
        "
              onClick={toggleOpenMenu}
            >
              <Cross1Icon />
            </Button>
          </motion.div>
        </div>
        {/* HEADER CONTENT */}
        <div className=" px-1 pt-31 ] h-full w-full flex flex-col lg:flex-row ">
          <motion.div
            className="h-auto w-full  lg:w-full   flex flex-col justify-start items-start   space-y-6  "
            variants={sectionVariants}
          >
            <div className="grid w-full    text-xs  px-3">
              <Input
                className="bg-secondary border-b-background placeholder:text-background placeholder:text-lg lg:placeholder:text-xl font-serif-display text-background text-lg lg:text-xl h-9 py-1 lg:mb-6 w-full"
                id="text"
                type="text"
                placeholder="Search..."
              />
            </div>
            <nav>
              <motion.ul
                className="flex flex-col  text-sm font-serif-book px-1"
                variants={listVariants}
              >
                {navItems.map((item) => (
                  <motion.li key={item.label} variants={itemVariants}>
                    <Link href={item.href} onClick={() => setOpen(false)}>
                      <Button
                        className="text-background"
                        variant="link"
                        size="default"
                      >
                        {item.label}
                      </Button>
                    </Link>
                  </motion.li>
                ))}
                {isAuthenticated && (
                  <motion.li variants={itemVariants}>
                    <Button
                      variant="link"
                      className="text-background"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? "Logging out..." : "Log Out"}
                    </Button>
                  </motion.li>
                )}
              </motion.ul>
            </nav>
            {/* FILTRERING CATEGORIER MM */}
          </motion.div>
          {/* <motion.div
            className=" w-full h-full lg:h-screen lg:w-1/2   flex flex-col  px-6 space-y-6  "
            variants={sectionVariants}
          >

            <motion.div
              className="grid grid-cols-2   justify-between  lg:flex-col items-baseline lg:justify-start  gap-0 border-t border-t-background py-9 "
              variants={listVariants}
            >
              {categories.map((category) => (
                <motion.div className="" key={category} variants={itemVariants}>
                  <Button
                    className="text-background font-display  hover:text-accent  w-min text-lg "
                    variant="link"
                    size="sm"
                  >
                    {category}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </motion.div> */}
          <motion.h1
            className="absolute bottom-0 right-0 p-4"
            variants={sectionVariants}
          >
            <Link
              className=" flex justify-start space-x-1 whitespace-nowrap"
              href="/"
            >
              <svg
                width="892"
                height="225"
                viewBox="0 0 892 225"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-12  w-fit"
              >
                <path
                  d="M446 0C467.419 1.49509e-06 484.782 6.296 484.782 14.0625V147.656H446C424.581 147.656 407.218 153.952 407.218 161.719V217.969C407.218 221.852 398.536 225 387.826 225H300.565C279.146 225 261.782 218.704 261.782 210.938V21.0938H251.976C241.317 21.1155 232.695 24.2542 232.695 28.124V210.938C232.695 218.704 215.332 225 193.913 225H38.7822C17.3634 225 0 218.704 0 210.938V168.75C0 162.925 13.0227 158.203 29.0869 158.203H87.2607C97.9703 158.203 106.652 161.351 106.652 165.234V198.633L106.657 198.769C106.856 201.618 113.289 203.906 121.195 203.906C129.227 203.906 135.739 201.545 135.739 198.633V14.0625C135.739 6.29603 153.103 4.9344e-05 174.521 0H446ZM853.218 0C874.637 7.77438e-05 892 6.29604 892 14.0625V210.938C892 218.704 874.637 225 853.218 225H707.782C686.363 225 669 218.704 669 210.938V21.0938H659.305L658.307 21.1025C648.061 21.2908 639.913 24.3631 639.913 28.125V210.938C639.913 218.704 622.55 225 601.131 225H455.695C434.276 225 416.913 218.704 416.913 210.938V161.719C416.913 155.894 429.936 151.172 446 151.172H494.479C505.188 151.172 513.869 154.32 513.869 158.203V198.633C513.869 201.545 520.381 203.906 528.413 203.906C536.445 203.906 542.956 201.545 542.956 198.633V14.0625C542.956 6.296 560.32 0 581.739 0H853.218ZM373.282 21.0938C365.25 21.0938 358.739 23.4548 358.739 26.3672V198.633C358.739 201.545 365.25 203.906 373.282 203.906C381.314 203.906 387.826 201.545 387.826 198.633V26.3672C387.826 23.4547 381.314 21.0938 373.282 21.0938ZM779.752 21.1006C772.067 21.2418 765.956 23.5457 765.956 26.3672V198.633C765.956 201.545 772.468 203.906 780.5 203.906C788.532 203.906 795.044 201.545 795.044 198.633V26.3672C795.044 23.5457 788.933 21.2418 781.248 21.1006L780.5 21.0938L779.752 21.1006Z"
                  fill="#ffff"
                />
              </svg>
            </Link>
          </motion.h1>
        </div>
      </motion.div>
    </>
  );
}
