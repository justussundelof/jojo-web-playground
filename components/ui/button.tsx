import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1  text-sm cursor-pointer  whitespace-nowrap rounded-none    transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          " font-serif-book font-normal bg-primary leading-tight tracking-wider text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-secondary text-secondary bg-transparent  hover:bg-secondary bg-transparent text-secondary border  hover:text-background dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary font-display text-background hover:bg-background  border border-secondary hover:text-secondary dark:bg-input/30 dark:border-input dark:hover:bg-input/50 ",

        ghost:
          "text-secondary hover:bg-transparent hover:text-accent-foreground dark:hover:bg-accent/50 font-serif-book",
        link: "text-secondary underline-offset-4 hover:underline font-extended font-light",
      },
      size: {
        default: "h-9 px-2 pb-1 text-2xl font-normal font-display  ",

        sm: "h-6 px-1 pb-0.5 text-sm  tracking-wide   flex items-start justify-start ",

        smRow:
          "h-6 px-1 pb-0.5 text-sm font-normal tracking-wide flex flex-row items-center justify-between",

        lg: "h-10 rounded-md px-6 has-[>svg]:px-4 ",
        icon: " h-6 aspect-square",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
