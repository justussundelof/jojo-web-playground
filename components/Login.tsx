"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type AuthView = "sign-in" | "sign-up" | "forgot-password";

export default function Login({
  openLogin,
  setOpenLogin,
}: {
  openLogin: boolean;
  setOpenLogin: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  if (!openLogin) return null;

  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    signIn,
    signUp,
    resetPassword,
    profile,
    loading: authLoading,
  } = useAuth();
  const [view, setView] = useState<AuthView>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Store redirect URL from query params when modal opens
  useEffect(() => {
    const redirectTo = searchParams.get("redirectTo");
    if (redirectTo && typeof window !== "undefined") {
      sessionStorage.setItem("intendedPath", redirectTo);
    }
  }, [searchParams]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(null);
  };

  const switchView = (newView: AuthView) => {
    resetForm();
    setView(newView);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn(email, password);

    if (!result.success) {
      setError(result.error || "An error occurred");
      setLoading(false);
      return;
    }

    // Close the modal
    setOpenLogin(false);
    setLoading(false);
  };

  // Handle redirect after successful login when profile is loaded
  useEffect(() => {
    if (!authLoading && profile) {
      // Get intended destination (stored before login redirect)
      const intendedPath =
        typeof window !== "undefined"
          ? sessionStorage.getItem("intendedPath") || "/"
          : "/";

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("intendedPath");
      }

      // Redirect based on role
      if (profile.role === "admin") {
        router.push(
          intendedPath.startsWith("/admin") ? intendedPath : "/admin"
        );
      } else {
        // Non-admin users should never go to /admin
        router.push(intendedPath.startsWith("/admin") ? "/" : intendedPath);
      }
      router.refresh();
    }
  }, [profile, authLoading, router]);

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const result = await signUp(email, password);

    if (!result.success) {
      setError(result.error || "An error occurred");
      setLoading(false);
      return;
    }

    setSuccess(
      "Account created! Please check your email to verify your account."
    );
    setLoading(false);
    // Optionally auto-switch to sign-in after a delay
    setTimeout(() => {
      switchView("sign-in");
    }, 3000);
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await resetPassword(email);

    if (!result.success) {
      setError(result.error || "An error occurred");
      setLoading(false);
      return;
    }

    setSuccess("Password reset email sent! Please check your inbox.");
    setLoading(false);
  };

  const renderSignIn = () => (
    <>
      <h1 className="font-serif-book text-sm">Sign in</h1>
      <form onSubmit={handleLogin} className="space-y-3 w-full">
        {error && (
          <div className="text-sm text-red-600 border border-red-600 px-4 py-3">
            {error}
          </div>
        )}

        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="max-w-sm"
          />
        </div>

        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="max-w-sm"
          />
        </div>

        <Button
          size="lg"
          type="submit"
          disabled={loading}
          className="w-full max-w-sm"
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      <div className="flex flex-col items-start justify-start w-full text-accent-foreground">
        <Button
          className=""
          variant="link"
          size="lg"
          onClick={() => switchView("sign-up")}
        >
          Create an account
        </Button>
        <Button
          variant="link"
          size="lg"
          onClick={() => switchView("forgot-password")}
        >
          Forgot your password
        </Button>
      </div>
    </>
  );

  const renderSignUp = () => (
    <>
      <h1 className="font-serif-book text-sm">Create an account</h1>
      <form onSubmit={handleSignUp} className="space-y-3 w-full">
        {error && (
          <div className="text-sm text-red-600 border border-red-600 px-4 py-3">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-green-600 border border-green-600 px-4 py-3">
            {success}
          </div>
        )}

        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="max-w-sm"
          />
        </div>

        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="max-w-sm"
          />
        </div>

        <div>
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="max-w-sm"
          />
        </div>

        <Button
          size="lg"
          type="submit"
          disabled={loading}
          className="w-full max-w-sm"
        >
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>
      <div className="flex flex-col items-start justify-start w-full">
        <Button variant="link" size="lg" onClick={() => switchView("sign-in")}>
          Already have an account? Sign in
        </Button>
      </div>
    </>
  );

  const renderForgotPassword = () => (
    <>
      <h1 className="font-serif-book text-sm">Reset your password</h1>
      <form onSubmit={handleForgotPassword} className="space-y-3 w-full">
        {error && (
          <div className="text-sm text-red-600 border border-red-600 px-4 py-3">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-green-600 border border-green-600 px-4 py-3">
            {success}
          </div>
        )}

        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="max-w-sm"
          />
        </div>

        <Button
          size="lg"
          type="submit"
          disabled={loading}
          className="w-full max-w-sm"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
      <div className="flex flex-col items-start justify-start w-full">
        <Button variant="link" size="lg" onClick={() => switchView("sign-in")}>
          Back to sign in
        </Button>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 top-0 right-0 left-auto z-50 h-screen overflow-hidden flex flex-col items-start justify-start px-3 w-full lg:w-1/2 bg-accent border-l border-l-accent-foreground ">
      <Button
        variant="link"
        size="sm"
        className="absolute top-0 z-50 left-0"
        onClick={() => setOpenLogin(!openLogin)}
      >
        Close [x]
      </Button>
      <div className="mt-[20vh] flex flex-col w-full items-start justify-start space-y-3">
        {view === "sign-in" && renderSignIn()}
        {view === "sign-up" && renderSignUp()}
        {view === "forgot-password" && renderForgotPassword()}
      </div>
    </div>
  );
}
