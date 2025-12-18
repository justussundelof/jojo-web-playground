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
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  // Show loading state during auth check
  if (loading) {
    return (
      <Button variant="link" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  // User is logged in - show Log out button
  if (user) {
    return (
      <Button variant="link" size="sm" onClick={handleSignOut}>
        Log out
      </Button>
    );
  }

  // User is not logged in - show Sign In button
  return (
    <Button onClick={() => setOpenLogin(!openLogin)} variant="link" size="sm">
      Sign In
    </Button>
  );
}
