"use client";

import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ProfileSection from "@/components/ProfileSection";
import WishlistModal from "@/components/WishlistModal";
import OrdersModal from "@/components/OrdersModal";
import Link from "next/link";
import { dummyOrders } from "@/data/dummyOrders";

export default function ProfilePage() {
    const { user, profile, isAuthenticated, loading, signOut } = useAuth();
    const { itemCount: wishlistCount } = useWishlist();
    const router = useRouter();

    const [wishlistOpen, setWishlistOpen] = useState(false);
    const [ordersOpen, setOrdersOpen] = useState(false);

    // Redirect to home if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/?login=true");
        }
    }, [loading, isAuthenticated, router]);

    const handleLogout = async () => {
        await signOut();
        router.push("/");
    };

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="font-serif-book text-sm">Loading...</p>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    const orderCount = dummyOrders.length;

    return (
        <>
            <div className="jojo-main-wrapper-top min-h-screen">
                <div className="jojo-container-padding">
                    {/* Breadcrumb */}
                    <nav className="mb-8">
                        <ol className="flex items-center space-x-2 text-xs font-mono">
                            <li>
                                <Link href="/" className="hover:underline">
                                    HOME
                                </Link>
                            </li>
                            <li>/</li>
                            <li className="text-accent-foreground/70">PROFILE</li>
                        </ol>
                    </nav>

                    {/* Profile Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                        {/* My Profile Section */}
                        <ProfileSection
                            title="My Profile"
                            description="Manage your personal information, update your password, or log out of your account."
                            buttonText="Go to my profile"
                            onButtonClick={() => { }}
                            disabled={true}
                        >
                            <p className="font-serif-book text-sm mb-2">
                                You are logged in as:
                            </p>
                            <p className="font-mono text-sm">{profile?.email || user?.email}</p>
                        </ProfileSection>

                        {/* Orders Section */}
                        <ProfileSection
                            title="Orders and Returns"
                            description="Once an order is placed, you'll be able to check its status here."
                            count={orderCount}
                            countLabel={orderCount === 1 ? "order" : "orders"}
                            buttonText="View orders and returns"
                            onButtonClick={() => setOrdersOpen(true)}
                        />

                        {/* Address Book Section (Placeholder) */}
                        <ProfileSection
                            title="Address Book"
                            description="Add or edit details to keep your shipping information up-to-date."
                            count={0}
                            countLabel="saved addresses"
                            buttonText="Manage address book"
                            onButtonClick={() => { }}
                            disabled={true}
                        />

                        {/* Wishlist Section */}
                        <ProfileSection
                            title="Wishlist"
                            description="Manage your favorite items and add them to your cart."
                            count={wishlistCount}
                            countLabel={wishlistCount === 1 ? "saved item" : "saved items"}
                            buttonText="Manage items"
                            onButtonClick={() => setWishlistOpen(true)}
                        />
                    </div>

                    {/* Log Out Button */}
                    <div className="border-t border-primary pt-8">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleLogout}
                            className="uppercase"
                        >
                            Log Out
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <WishlistModal open={wishlistOpen} setOpen={setWishlistOpen} />
            <OrdersModal open={ordersOpen} setOpen={setOrdersOpen} />
        </>
    );
}