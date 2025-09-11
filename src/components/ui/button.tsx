import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 will-change-transform",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 hover:shadow-md active:scale-95 active:transition-transform active:duration-75",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105 hover:shadow-md active:scale-95 active:transition-transform active:duration-75",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:scale-105 hover:shadow-md active:scale-95 active:transition-transform active:duration-75",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105 hover:shadow-md active:scale-95 active:transition-transform active:duration-75",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95 active:transition-transform active:duration-75",
        link: "text-primary underline-offset-4 hover:underline hover:scale-105 active:scale-95",
        gradient: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 hover:scale-105 hover:shadow-xl active:scale-95 active:transition-transform active:duration-75 shadow-lg",
        success: "bg-green-600 text-white hover:bg-green-700 hover:scale-105 hover:shadow-md active:scale-95 active:transition-transform active:duration-75",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700 hover:scale-105 hover:shadow-md active:scale-95 active:transition-transform active:duration-75",
        info: "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 hover:shadow-md active:scale-95 active:transition-transform active:duration-75",
        floating: "bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl hover:bg-background/90 hover:scale-105 active:scale-95 active:transition-transform active:duration-75",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xs: "h-7 rounded px-2 text-xs",
        xl: "h-12 rounded-lg px-10 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
