"use client";

import { motion, Variants } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { clsx } from "clsx";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    index?: number;
    className?: string;
}

export function FeatureCard({
    icon: Icon,
    title,
    description,
    index = 0,
    className,
}: FeatureCardProps) {
    const cardVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 40
        },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
            },
        }),
    };

    const iconVariants: Variants = {
        initial: { scale: 1, rotate: 0 },
        hover: {
            scale: 1.1,
            rotate: 5,
            transition: {
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
            },
        },
    };

    return (
        <motion.div
            custom={index}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className={clsx(
                "group relative p-8 bg-muted/20 border border-muted",
                "hover:border-foreground/30 hover:bg-muted/30",
                "transition-colors duration-300",
                "cursor-pointer",
                className
            )}
        >
            {/* Brutalist corner accent */}
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Icon */}
            <motion.div
                variants={iconVariants}
                initial="initial"
                whileHover="hover"
                className="mb-6 w-14 h-14 flex items-center justify-center bg-accent/10 border border-accent/30 group-hover:bg-accent group-hover:border-accent transition-colors duration-300"
            >
                <Icon className="w-7 h-7 text-accent group-hover:text-background transition-colors duration-300" />
            </motion.div>

            {/* Content */}
            <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-foreground group-hover:text-accent transition-colors duration-300">
                {title}
            </h3>

            <p className="text-foreground/60 text-sm leading-relaxed">
                {description}
            </p>

            {/* Bottom arrow indicator */}
            <div className="mt-6 flex items-center gap-2 text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs font-bold uppercase tracking-wider">Learn more</span>
                <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                </svg>
            </div>
        </motion.div>
    );
}
