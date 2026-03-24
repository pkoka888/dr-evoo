"use client";

import { motion, Variants } from "framer-motion";
import { clsx } from "clsx";
import { Quote } from "lucide-react";

/**
 * Testimonial data from content collection
 */
interface Testimonial {
    id: string;
    data: {
        name: string;
        role: string;
        company: string;
        avatar?: string;
        quote: string;
    };
}

interface TestimonialsProps {
    testimonials: Testimonial[];
    className?: string;
}

/**
 * Testimonials - Displays customer testimonials with brutalist styling
 * Uses Framer Motion for animations
 */
export function Testimonials({ testimonials, className }: TestimonialsProps) {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
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
            className={clsx("space-y-8", className)}
        >
            {testimonials.map((testimonial, index) => (
                <motion.div
                    key={testimonial.id}
                    variants={cardVariants}
                    whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.3 }
                    }}
                    className={clsx(
                        "relative p-8",
                        "bg-muted/20 border border-muted",
                        "hover:border-foreground/30 hover:bg-muted/30",
                        "transition-colors duration-300"
                    )}
                >
                    {/* Quote Icon - Brutalist accent */}
                    <div className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-accent/10 border border-accent/30">
                        <Quote className="w-6 h-6 text-accent" />
                    </div>

                    {/* Quote Text */}
                    <blockquote className="relative z-10 mb-6">
                        <p className="text-foreground/80 text-lg leading-relaxed italic">
                            "{testimonial.data.quote}"
                        </p>
                    </blockquote>

                    {/* Author Info */}
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 flex items-center justify-center bg-accent text-foreground font-black text-lg">
                            {testimonial.data.name.charAt(0)}
                        </div>

                        <div>
                            <div className="font-bold text-foreground uppercase tracking-wider">
                                {testimonial.data.name}
                            </div>
                            <div className="text-foreground/50 text-sm">
                                {testimonial.data.role} at <span className="text-accent">{testimonial.data.company}</span>
                            </div>
                        </div>
                    </div>

                    {/* Corner accent */}
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
            ))}
        </motion.div>
    );
}
