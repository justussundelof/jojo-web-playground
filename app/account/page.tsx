"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AccountPage() {
  const { user, profile, loading, profileLoading, signOut } = useAuth();
  const router = useRouter();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  // Show loading state
  if (loading || profileLoading) {
    return (
      <div className="jojo-main-wrapper min-h-screen">
        <div className="jojo-container-padding">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="jojo-main-wrapper min-h-screen">
      <div className="jojo-container-padding space-y-8">
        {/* Profile Section */}
        <section>
          <h1 className="font-serif-display text-2xl mb-6">Account</h1>

          <div className="space-y-4">
            <div>
              <p className="text-lg font-serif-book">
                Welcome
                {profile?.first_name ? `, ${profile.first_name}` : ""}!
              </p>
              <p className="text-sm opacity-60">{profile?.email || user.email}</p>
            </div>

            {profile && (
              <div className="border-t pt-4 space-y-2">
                <h2 className="font-serif-book text-sm uppercase tracking-wider opacity-60">
                  Profile Details
                </h2>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div>
                    <p className="text-xs opacity-60">First Name</p>
                    <p className="text-sm">{profile.first_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-60">Last Name</p>
                    <p className="text-sm">{profile.last_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-60">Email</p>
                    <p className="text-sm">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-60">Member Since</p>
                    <p className="text-sm">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Orders Section */}
        <section className="border-t pt-8">
          <h2 className="font-serif-book text-sm uppercase tracking-wider opacity-60 mb-4">
            Your Orders
          </h2>

          <div className="space-y-4">
            {/* Placeholder for orders - will be populated when orders table exists */}
            <div className="text-center py-8 border border-dashed rounded">
              <p className="text-sm opacity-60 mb-4">No orders yet</p>
              <Link href="/">
                <Button variant="link" size="sm">
                  Start Shopping
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Actions Section */}
        <section className="border-t pt-8">
          <Button variant="link" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </section>
      </div>
    </div>
  );
}
