"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login({
  openLogin,
  setOpenLogin,
}: {
  openLogin: boolean;
  setOpenLogin: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  if (!openLogin) return null;

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setOpenLogin(false);
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="fixed inset-0 top-0 right-0 left-auto z-40 h-screen overflow-hidden flex flex-col items-start justify-start  px-3 w-full lg:w-1/2 bg-background  ">
      <Button
        variant="link"
        size="sm"
        className="absolute top-0 z-50 left-0"
        onClick={() => setOpenLogin(!openLogin)}
      >
        Close [x]
      </Button>
      <div className="mt-[20vh] flex flex-col    w-full items-start justify-start space-y-3 ">
        <h1 className="  font-serif-book text-sm ">Sign in</h1>

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
              className="max-w-sm "
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
            onClick={handleLogin}
            className="w-full max-w-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="flex flex-col items-start justify-start w-full">
          <Button variant="link" size="lg" className="">
            Create an account
          </Button>
          <Button variant="link" size="lg" className="">
            Forgot your password
          </Button>
        </div>
      </div>
    </div>
  );
}
