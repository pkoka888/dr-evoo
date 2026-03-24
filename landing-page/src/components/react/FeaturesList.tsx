"use client";

import { motion, Variants } from "framer-motion";
import { clsx } from "clsx";
import {
    Sparkles,
    Wand2,
    Network,
    TestTube,
    Plug,
    type LucideIcon
} from "lucide-react";

/**
 * Icon mapping from string names to Lucide icons
 */
const iconMap: Record<string, LucideIcon> = {
    Sparkles,
    Wand2,
    Network,
    TestTube,
    Plug,
};

/**
 * Feature data from content collection
 */
interface Feature {
    slug: string;
    data: {
        title: string;
        description: string;
        icon: string;
        order: number;
    };
}

interface FeaturesListProps {
    features: Feature[];
    className?: string;
}

/**
 * FeaturesList - Displays features from the content collection
 * Uses brutalist styling with dark theme
 */
export function FeaturesList({ features, className }: FeaturesListProps) {
    // Sort features by order
    const sortedFeatures = [...features].sort((a, b) => a.data.order - b.data.order);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const cardVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 40,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
            },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className={clsx(
                "grid gap-6",
                "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                className
            )}
        >
            {sortedFeatures.map((feature, index) => {
                const Icon = iconMap[feature.data.icon] || Sparkles;

                return (
                    <motion.div
                        key={feature.slug}
                        variants={cardVariants}
                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                        className={clsx(
                            "group relative p-8",
                            "bg-muted/20 border border-muted",
                            "hover:border-foreground/30 hover:bg-muted/30",
                            "transition-colors duration-300",
                            "cursor-pointer"
                        )}
                    >
                        {/* Brutalist corner accent */}
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 1, rotate: 0 }}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.3 }}
                            className="mb-6 w-14 h-14 flex items-center justify-center bg-accent/10 border border-accent/30 group-hover:bg-accent group-hover:border-accent transition-colors duration-300"
                        >
                            <Icon className="w-7 h-7 text-accent group-hover:text-background transition-colors duration-300" />
                        </motion.div>

                        {/* Content */}
                        <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-foreground group-hover:text-accent transition-colors duration-300">
                            {feature.data.title}
                        </h3>

                        <p className="text-foreground/60 text-sm leading-relaxed">
                            {feature.data.description}
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
            })}
        </motion.div>
    );
}
