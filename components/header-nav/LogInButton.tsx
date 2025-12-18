"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthContext";

export default function LogInButton({
  openLogin,
  setOpenLogin,
}: {
  openLogin: boolean;
  setOpenLogin: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const { user, profile, signOut, loading, profileLoading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  // Show loading state during auth check
  if (loading) {
    return (
      <Button variant="link" size="sm" disabled>
        ...
      </Button>
    );
  }

  // User is logged in
  if (user) {
    const displayName = profile?.first_name || "Account";

    return (
      <div className="flex items-center">
        <Button
          variant="link"
          size="sm"
          onClick={() => router.push("/account")}
          disabled={profileLoading}
        >
          {profileLoading ? "..." : displayName}
        </Button>
        <Button variant="link" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    );
  }

  // User is not logged in
  return (
    <Button onClick={() => setOpenLogin(!openLogin)} variant="link" size="sm">
      Sign In
    </Button>
  );
}
