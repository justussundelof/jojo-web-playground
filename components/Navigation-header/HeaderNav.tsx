"use client";

import { Button } from "../ui/button";
import { useSite } from "@/context/SiteContext";
import { useState, useEffect, useMemo } from "react";
import { Badge } from "../ui/badge";
import LoaderJoJo from "../LoaderJoJo";
import { useAuth } from "@/context/AuthContext";
import { HeartIcon } from "@radix-ui/react-icons";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";
import ThemeSwitch from "./ThemeSwitch";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
  type Variants,
} from "framer-motion";
import Login from "../Login";
import MenuOverlay from "./MenuOverlay";
import CartModal from "../CartModal";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import LogInButton from "./LogInButton";
import {
  Cross1Icon,
  HamburgerMenuIcon,
  HeartFilledIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { useCart } from "@/context/CartContext";
import FloatingNav from "./FloatingNav";

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

// LOADING BAR VARIANTS

const loadingBarVariants: Variants = {
  idle: {
    scaleX: 0,
    backgroundColor: "var(--accent)",
  },
  loading: {
    scaleX: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  complete: {
    scaleX: 1,
    backgroundColor: "var(--secondary)",
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function HeaderNav() {
  const { currentSite, toggleSite } = useSite();
  const [open, setOpen] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { itemCount } = useCart();
  const { itemCount: wishlistItemCount } = useWishlist();

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isAdminPage = pathname.startsWith("/admin");
  const { isAuthenticated, isAdmin, signOut } = useAuth();

  const navItems = useMemo(() => {
    const baseItems = [
      { label: "Products", href: "/" },
      { label: "Visit The Store", href: "/" },
      { label: "About JOJO", href: "/pages/about" },
      { label: "Privacy Policy", href: "/pages/privacy-policy" },
      { label: "Imprint", href: "/pages/imprint" },
    ];

    // Add Profile or Admin link based on user role
    if (isAuthenticated) {
      if (isAdmin) {
        baseItems.push({ label: "Admin", href: "/admin" });
      } else {
        baseItems.push({ label: "Profile", href: "/profile" });
      }
    }

    return baseItems;
  }, [isAuthenticated, isAdmin]);

  // Check for ?login=true query param and auto-open login modal
  useEffect(() => {
    const loginParam = searchParams.get("login");
    if (loginParam === "true") {
      setOpenLogin(true);
      // Clear the query param from URL without page reload
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("login");
      router.replace(newUrl.pathname + newUrl.search, { scroll: false });
    }
  }, [searchParams, router]);

  const progress = useMotionValue(0);

  function toggleOpenMenu() {
    setOpen((prev) => !prev);
  }

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header
        className={`
    absolute z-40 top-0 left-0 right-0  flex justify-between w-full items-start   pr-1  h-11 pt-1  
   
    ${isAdminPage ? "pl-1 lg:pl-10 " : "pl-1 "}
    ${isAdminPage ? "pl-3 lg:pl-10  " : "pl-1"}
  `}
      >
        <span className="flex items-start justify-start space-x-1">
          <motion.h1 className="" variants={headerItemVariants}>
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
                className="h-9 w-fit"
              >
                <path
                  d="M446 0C467.419 1.49509e-06 484.782 6.296 484.782 14.0625V147.656H446C424.581 147.656 407.218 153.952 407.218 161.719V217.969C407.218 221.852 398.536 225 387.826 225H300.565C279.146 225 261.782 218.704 261.782 210.938V21.0938H251.976C241.317 21.1155 232.695 24.2542 232.695 28.124V210.938C232.695 218.704 215.332 225 193.913 225H38.7822C17.3634 225 0 218.704 0 210.938V168.75C0 162.925 13.0227 158.203 29.0869 158.203H87.2607C97.9703 158.203 106.652 161.351 106.652 165.234V198.633L106.657 198.769C106.856 201.618 113.289 203.906 121.195 203.906C129.227 203.906 135.739 201.545 135.739 198.633V14.0625C135.739 6.29603 153.103 4.9344e-05 174.521 0H446ZM853.218 0C874.637 7.77438e-05 892 6.29604 892 14.0625V210.938C892 218.704 874.637 225 853.218 225H707.782C686.363 225 669 218.704 669 210.938V21.0938H659.305L658.307 21.1025C648.061 21.2908 639.913 24.3631 639.913 28.125V210.938C639.913 218.704 622.55 225 601.131 225H455.695C434.276 225 416.913 218.704 416.913 210.938V161.719C416.913 155.894 429.936 151.172 446 151.172H494.479C505.188 151.172 513.869 154.32 513.869 158.203V198.633C513.869 201.545 520.381 203.906 528.413 203.906C536.445 203.906 542.956 201.545 542.956 198.633V14.0625C542.956 6.296 560.32 0 581.739 0H853.218ZM373.282 21.0938C365.25 21.0938 358.739 23.4548 358.739 26.3672V198.633C358.739 201.545 365.25 203.906 373.282 203.906C381.314 203.906 387.826 201.545 387.826 198.633V26.3672C387.826 23.4547 381.314 21.0938 373.282 21.0938ZM779.752 21.1006C772.067 21.2418 765.956 23.5457 765.956 26.3672V198.633C765.956 201.545 772.468 203.906 780.5 203.906C788.532 203.906 795.044 201.545 795.044 198.633V26.3672C795.044 23.5457 788.933 21.2418 781.248 21.1006L780.5 21.0938L779.752 21.1006Z"
                  fill="#7C0E0F"
                />
              </svg>
            </Link>
          </motion.h1>
          <motion.div variants={headerItemVariants}>
            <Button onClick={toggleSite} variant="secondary">
              {currentSite === "sale"
                ? "For Sale"
                : currentSite === "rent"
                ? "For Rent"
                : "Studio"}
            </Button>
          </motion.div>
          <motion.div className="" variants={headerItemVariants}>
            <Button
              className="font-display"
              onClick={toggleOpenMenu}
              variant="outline"
              size="default"
            >
              Menu
            </Button>
          </motion.div>
        </span>

        <span className="flex justify-end items-center space-x-1 lg:pr-1 w-full">
          <motion.div className="" variants={headerItemVariants}>
            <LogInButton openLogin={openLogin} setOpenLogin={setOpenLogin} />
          </motion.div>

          <motion.div
            className={` ${currentSite === "neutral" ? "hidden" : "block"}`}
            variants={headerItemVariants}
          >
            <Button
              variant="link"
              size="sm"
              className="relative hidden lg:block "
              onClick={() => setOpenLogin}
            >
              Wishlist
              {wishlistItemCount > 0 && (
                <span className="absolute -top-0.5 -right-2 bg-secondary text-secondary-foreground text-xs min-w-4 h-4 flex items-center justify-center rounded-full px-1 pb-0.5 font-mono">
                  {wishlistItemCount}
                </span>
              )}
            </Button>
          </motion.div>
          <motion.div
            className={` ${currentSite === "neutral" ? "hidden" : "block"}`}
            variants={headerItemVariants}
          >
            <Button
              variant="link"
              size="sm"
              className="block lg:hidden relative aspect-square "
              onClick={() => setOpenLogin}
            >
              <HeartIcon />
              {wishlistItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-secondary text-secondary-foreground text-xs w-3 h-3 flex items-center justify-center rounded-full px-1 pb-0.5 font-mono">
                  {wishlistItemCount}
                </span>
              )}
            </Button>
          </motion.div>
          <motion.div
            className={` ${currentSite === "neutral" ? "hidden" : "block"}`}
            variants={headerItemVariants}
          >
            <Button
              variant="link"
              size="sm"
              className="relative hidden lg:block "
              onClick={() => setCartOpen(true)}
            >
              Cart
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-2 bg-secondary text-secondary-foreground text-xs min-w-4 h-4 flex items-center justify-center rounded-full px-1 pb-0.5 font-mono">
                  {itemCount}
                </span>
              )}
            </Button>
          </motion.div>
          <motion.div
            className={` ${currentSite === "neutral" ? "hidden" : "block"}`}
            variants={headerItemVariants}
          >
            <Button
              variant="ghost"
              size="default"
              className="relative block lg:hidden aspect-square "
              onClick={() => setCartOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="512"
                height="512"
                viewBox="0 0 32 32"
              >
                <path
                  fill="none"
                  stroke="#7C0E0F"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 9v20h22V9Zm5 0s0-6 6-6s6 6 6 6"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-secondary text-secondary-foreground text-xs w-3 h-3 flex items-center justify-center rounded-full px-1 pb-0.5 font-mono">
                  {itemCount}
                </span>
              )}
            </Button>
          </motion.div>
        </span>
      </header>

      <FloatingNav
        open={open}
        setOpen={setOpen}
        toggleOpenMenu={toggleOpenMenu}
      />

      <AnimatePresence>
        {open && (
          <MenuOverlay
            open={open}
            setOpen={setOpen}
            toggleOpenMenu={toggleOpenMenu}
            navItems={navItems}
            handleLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openLogin && (
          <Login openLogin={openLogin} setOpenLogin={setOpenLogin} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        <CartModal open={cartOpen} setOpen={setCartOpen} />
      </AnimatePresence>
    </>
  );
}
