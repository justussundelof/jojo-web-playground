"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthContext";
import { PersonIcon } from "@radix-ui/react-icons";

export default function LogInButton({
  openLogin,
  setOpenLogin,
}: {
  openLogin: boolean;
  setOpenLogin: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { isAuthenticated, profile, isAdmin, signOut, loading } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setDropdownOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = (path: string) => {
    setDropdownOpen(false);
    router.push(path);
  };

  // Show loading state during initial auth check
  if (loading) {
    return (
      <Button variant="link" size="sm" disabled>
        ...
      </Button>
    );
  }

  // Not authenticated - show Log In button
  if (!isAuthenticated) {
    return (
      <Button
        onClick={() => setOpenLogin(!openLogin)}
        variant="outline"
        size="sm"
      >
        Log In
      </Button>
    );
  }

  // Authenticated - show user dropdown
  const displayName = profile?.email?.split("@")[0] || "Account";

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="link"
        className="hidden lg:block"
        size="sm"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {displayName}
      </Button>
      <Button
        variant="ghost"
        className="block lg:hidden aspect-square"
        size="default"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <PersonIcon />
      </Button>
      {dropdownOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 w-48 bg-background border border-secondary shadow-lg text-secondary font-extended z-50">
          {isAdmin ? (
            <button
              onClick={() => handleNavigation("/admin")}
              className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
            >
              Admin Dashboard
            </button>
          ) : (
            <button
              onClick={() => handleNavigation("/profile")}
              className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
            >
              Profile
            </button>
          )}
          <button
            onClick={() => handleNavigation("/profile/wishlist")}
            className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
          >
            Wishlist
          </button>
          <div className="border-t border-secondary" />
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full text-left px-4 py-2 text-sm hover:bg-accent disabled:opacity-50 font-extended"
          >
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </button>
        </div>
      )}
    </div>
  );
}
