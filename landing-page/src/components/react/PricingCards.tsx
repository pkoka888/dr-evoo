"use client";

import { motion, Variants } from "framer-motion";
import { clsx } from "clsx";
import { Check } from "lucide-react";

/**
 * Pricing tier data from content collection
 */
interface PricingTier {
    id: string;
    data: {
        name: string;
        price: string;
        period?: string;
        description: string;
        features: string[];
        highlighted: boolean;
        cta: string;
    };
}

interface PricingCardsProps {
    tiers: PricingTier[];
    className?: string;
}

/**
 * PricingCards - Displays pricing tiers with brutalist styling
 * Uses Framer Motion for animations
 */
export function PricingCards({ tiers, className }: PricingCardsProps) {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const cardVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 60,
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.7,
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
                "grid gap-8",
                "grid-cols-1 md:grid-cols-3",
                className
            )}
        >
            {tiers.map((tier, index) => (
                <motion.div
                    key={tier.id}
                    variants={cardVariants}
                    whileHover={{
                        y: -12,
                        transition: { duration: 0.3 }
                    }}
                    className={clsx(
                        "relative p-8 flex flex-col",
                        tier.data.highlighted
                            ? "bg-accent/10 border-2 border-accent"
                            : "bg-muted/20 border border-muted hover:border-foreground/30",
                        "transition-colors duration-300"
                    )}
                >
                    {/* Brutalist corner accent for highlighted */}
                    {tier.data.highlighted && (
                        <div className="absolute top-0 right-0 w-8 h-8">
                            <div className="absolute top-0 right-0 w-full h-full border-t-2 border-r-2 border-foreground" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent" />
                        </div>
                    )}

                    {/* Badge for highlighted */}
                    {tier.data.highlighted && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="bg-accent text-background text-xs font-black uppercase tracking-widest px-4 py-1">
                                Most Popular
                            </span>
                        </div>
                    )}

                    {/* Plan Name */}
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-foreground">
                        {tier.data.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-5xl font-black tracking-tight text-foreground">
                            {tier.data.price}
                        </span>
                        {tier.data.period && (
                            <span className="text-foreground/50 text-sm font-medium">
                                {tier.data.period}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-foreground/60 text-sm mb-8">
                        {tier.data.description}
                    </p>

                    {/* Features List */}
                    <ul className="flex-1 space-y-4 mb-8">
                        {tier.data.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start gap-3">
                                <div className={clsx(
                                    "flex-shrink-0 w-5 h-5 flex items-center justify-center",
                                    tier.data.highlighted
                                        ? "bg-accent text-background"
                                        : "bg-foreground/10 text-accent"
                                )}>
                                    <Check className="w-3 h-3" strokeWidth={3} />
                                </div>
                                <span className="text-foreground/80 text-sm">
                                    {feature}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* CTA Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={clsx(
                            "w-full h-14 font-bold uppercase tracking-widest text-sm",
                            tier.data.highlighted
                                ? "bg-accent text-foreground hover:bg-accent/90"
                                : "border border-foreground/30 text-foreground hover:bg-foreground/10",
                            "transition-colors duration-300"
                        )}
                    >
                        {tier.data.cta}
                    </motion.button>
                </motion.div>
            ))}
        </motion.div>
    );
}
