import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔑 Prevent SSR mismatch
  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";
  return (
    <>
      <Button
        size="sm"
        variant="link"
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {isDark ? "Dark / Light" : "Light / Dark"}
      </Button>
    </>
  );
}
