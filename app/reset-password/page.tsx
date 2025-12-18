"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        const supabase = createClient();

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            });

            if (updateError) {
                setError(updateError.message);
                setLoading(false);
                return;
            }

            setSuccess(true);
            setLoading(false);

            // Redirect to home after 2 seconds
            setTimeout(() => {
                router.push("/");
            }, 2000);
        } catch (err) {
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full space-y-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-serif-book mb-4">Password Updated</h1>
                        <div className="text-sm text-green-600 border border-green-600 px-4 py-3 mb-4">
                            Your password has been successfully updated. Redirecting...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-4">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-serif-book">Reset Your Password</h1>
                    <p className="text-sm text-gray-600 mt-2">
                        Enter your new password below
                    </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                    {error && (
                        <div className="text-sm text-red-600 border border-red-600 px-4 py-3">
                            {error}
                        </div>
                    )}

                    <div>
                        <Input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <Input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </Button>
                </form>

                <div className="text-center">
                    <Button
                        variant="link"
                        onClick={() => router.push("/")}
                        size="lg"
                    >
                        Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );
}