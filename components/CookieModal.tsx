import { Card, CardAction, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CookieModal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-end p-1 w-full "
    >
      <Card className="w-[90vw] max-w-sm bg-accent border-secondary border text-accent-foreground p-1">
        <CardDescription className="font-serif-book pt-6 pb-6 px-6">
          <p className="whitespace-normal wrap-break-word text-sm">
            By continuing to browse this site, you agree to the use of cookies
            to identify your session and to remember your login after you close
            the browser (authentication cookies).
          </p>
        </CardDescription>

        <CardAction className="flex gap-1 justify-end items-end w-full ">
          <Button asChild className="" variant="secondary" size="lg">
            <Link href="/pages/privacy-policy">Learn more</Link>
          </Button>

          <Button size="lg">Agree & Close</Button>
        </CardAction>
      </Card>
    </motion.div>
  );
}
