"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const { user, profile, loading, profileLoading } = useAuth();
  const router = useRouter();

  // Don't render while loading or if not authenticated
  if (loading || profileLoading || !user) return null;

  const displayName = profile?.first_name || "Account";

  return (
    <Button
      variant="link"
      size="sm"
      className={className}
      onClick={() => router.push("/account")}
    >
      {displayName}
    </Button>
  );
}
