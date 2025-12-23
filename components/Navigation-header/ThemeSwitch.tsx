import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

import { Button } from "../ui/button";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

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
        onClick={() => setTheme(isDark ? "light" : "dark")}
        variant="secondary"
        size="sm"
        className={`uppercase `}
      >
        {isDark ? "Light Mode" : "Dark Mode"}
      </Button>
    </>
  );
}
