"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { clsx } from "clsx";

interface ButtonProps {
    variant?: "primary" | "secondary";
    children: React.ReactNode;
    href?: string;
    icon?: LucideIcon;
    iconPosition?: "left" | "right";
    className?: string;
    onClick?: () => void;
}

export function Button({
    variant = "primary",
    children,
    href,
    icon: Icon,
    iconPosition = "right",
    className,
    onClick,
}: ButtonProps) {
    const baseStyles = clsx(
        "group relative flex items-center justify-center gap-2",
        "h-14 md:h-16 px-8 md:px-10",
        "font-bold uppercase tracking-widest text-sm",
        "overflow-hidden transition-transform",
        "hover:scale-[1.02] active:scale-[0.98]",
        className
    );

    const primaryStyles = clsx(
        "bg-accent text-foreground",
        "before:absolute before:inset-0 before:bg-white/20",
        "before:translate-y-full before:transition-transform before:duration-300 before:ease-out",
        "hover:before:translate-y-0"
    );

    const secondaryStyles = clsx(
        "bg-transparent border",
        variant === "secondary" && "border-muted text-foreground hover:border-foreground/50",
        variant === "primary" && "bg-accent text-foreground"
    );

    const content = (
        <span className="relative z-10 flex items-center gap-2">
            {Icon && iconPosition === "left" && (
                <Icon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            )}
            {children}
            {Icon && iconPosition === "right" ? (
                <motion.span
                    animate={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                >
                    <Icon className="w-5 h-5" />
                </motion.span>
            ) : Icon ? (
                <Icon className="w-5 h-5" />
            ) : null}
        </span>
    );

    const buttonVariants: Variants = {
        initial: { opacity: 0, y: 10 },
        animate: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
        },
        hover: {
            y: -2,
            transition: { duration: 0.2 }
        }
    };

    const motionProps = {
        variants: buttonVariants,
        initial: "initial",
        animate: "animate",
        whileHover: "hover",
    };

    if (href) {
        return (
            <motion.a
                href={href}
                className={clsx(baseStyles, variant === "primary" ? primaryStyles : secondaryStyles)}
                {...motionProps}
            >
                {content}
            </motion.a>
        );
    }

    return (
        <motion.button
            onClick={onClick}
            className={clsx(baseStyles, variant === "primary" ? primaryStyles : secondaryStyles)}
            {...motionProps}
        >
            {content}
        </motion.button>
    );
}
