"use client";

import { useSite } from "@/context/SiteContext";
import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

import { AnimatePresence } from "framer-motion";
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
    x: 12,
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

export default function FloatingNav({
  open,
  setOpen,
  toggleOpenMenu,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleOpenMenu: () => void;
}) {
  const { toggleSite, currentSite } = useSite();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin") {
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const MIN_SCROLL = 150;

      const canScroll =
        document.body.scrollHeight > window.innerHeight + MIN_SCROLL;

      if (!canScroll) {
        setShowNav(false);
        setLastScrollY(currentScrollY);
        return;
      }

      if (currentScrollY < MIN_SCROLL) {
        setShowNav(false);
      } else if (currentScrollY < lastScrollY) {
        setShowNav(true);
      } else {
        setShowNav(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, pathname]);

  // ✅ CONDITIONAL RENDER GOES HERE
  if (pathname === "/admin") {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {(showNav || open) && (
          <motion.div
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed bottom-0 right-0 left-0 z-30 pb-9 pr-9 pl-9 w-full flex justify-end lg:justify-start  items-start"
          >
            <motion.div
              variants={headerVariants}
              initial="hidden"
              animate="visible"
              className="flex  items-start justify-between bg-background     space-x-1 p-1  border-secondary border-l-6 border-b border-r border-t rounded-none w-full lg:w-auto h-18 "
            >
              <div className="flex items-center justify-start space-x-1">
                <motion.div variants={headerItemVariants}>
                  <Link
                    className="flex justify-start space-x-1 whitespace-nowrap"
                    href="/"
                  >
                    <svg
                      width="892"
                      height="225"
                      viewBox="0 0 892 225"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="max-h-9 w-fit"
                    >
                      <path
                        d="M446 0C467.419 1.49509e-06 484.782 6.296 484.782 14.0625V147.656H446C424.581 147.656 407.218 153.952 407.218 161.719V217.969C407.218 221.852 398.536 225 387.826 225H300.565C279.146 225 261.782 218.704 261.782 210.938V21.0938H251.976C241.317 21.1155 232.695 24.2542 232.695 28.124V210.938C232.695 218.704 215.332 225 193.913 225H38.7822C17.3634 225 0 218.704 0 210.938V168.75C0 162.925 13.0227 158.203 29.0869 158.203H87.2607C97.9703 158.203 106.652 161.351 106.652 165.234V198.633L106.657 198.769C106.856 201.618 113.289 203.906 121.195 203.906C129.227 203.906 135.739 201.545 135.739 198.633V14.0625C135.739 6.29603 153.103 4.9344e-05 174.521 0H446ZM853.218 0C874.637 7.77438e-05 892 6.29604 892 14.0625V210.938C892 218.704 874.637 225 853.218 225H707.782C686.363 225 669 218.704 669 210.938V21.0938H659.305L658.307 21.1025C648.061 21.2908 639.913 24.3631 639.913 28.125V210.938C639.913 218.704 622.55 225 601.131 225H455.695C434.276 225 416.913 218.704 416.913 210.938V161.719C416.913 155.894 429.936 151.172 446 151.172H494.479C505.188 151.172 513.869 154.32 513.869 158.203V198.633C513.869 201.545 520.381 203.906 528.413 203.906C536.445 203.906 542.956 201.545 542.956 198.633V14.0625C542.956 6.296 560.32 0 581.739 0H853.218ZM373.282 21.0938C365.25 21.0938 358.739 23.4548 358.739 26.3672V198.633C358.739 201.545 365.25 203.906 373.282 203.906C381.314 203.906 387.826 201.545 387.826 198.633V26.3672C387.826 23.4547 381.314 21.0938 373.282 21.0938ZM779.752 21.1006C772.067 21.2418 765.956 23.5457 765.956 26.3672V198.633C765.956 201.545 772.468 203.906 780.5 203.906C788.532 203.906 795.044 201.545 795.044 198.633V26.3672C795.044 23.5457 788.933 21.2418 781.248 21.1006L780.5 21.0938L779.752 21.1006Z"
                        fill="#7C0E0F"
                      />
                    </svg>
                  </Link>
                </motion.div>
                <motion.div variants={headerItemVariants}>
                  <div
                    role="button"
                    className="flex justify-start items-start space-x-1 "
                    onClick={toggleSite}
                  >
                    <Button variant="secondary" size="default">
                      {currentSite === "sale" ? "For Rent" : "For Sale"}
                    </Button>
                    <Badge
                      variant="secondary"
                      className="  line-through whitespace-nowrap"
                    >
                      {currentSite === "sale" ? "SALE" : "RENT"}
                    </Badge>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <div className="flex     items-start justify-start pl-1 bg-secondary   ">
              <Button
                variant="outline"
                className="bg-background border-l-0.5"
                size="default"
                onClick={toggleOpenMenu}
              >
                {open ? "Close" : "Menu"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
