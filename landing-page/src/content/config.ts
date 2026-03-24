import { defineCollection, z } from "astro:content";

/**
 * Content Collections Schema Configuration
 * 
 * Defines schemas for features, testimonials, and pricing collections
 * using Zod for build-time validation.
 */

// Features Collection - MDX content with metadata
const features = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string().describe('Feature title'),
        description: z.string().describe('Brief description of the feature'),
        icon: z.string().describe('Lucide icon name'),
        order: z.number().default(0).describe('Display order'),
    }),
});

// Testimonials Collection - JSON data
const testimonials = defineCollection({
    type: 'data',
    schema: z.object({
        name: z.string().describe('Person name'),
        role: z.string().describe('Job role'),
        company: z.string().describe('Company name'),
        avatar: z.string().optional().describe('Avatar image URL'),
        quote: z.string().describe('Testimonial quote'),
    }),
});

// Pricing Collection - JSON data
const pricing = defineCollection({
    type: 'data',
    schema: z.object({
        name: z.string().describe('Plan name'),
        price: z.string().describe('Price display (e.g., "$0", "Custom")'),
        period: z.string().optional().describe('Billing period (e.g., "/month")'),
        description: z.string().describe('Short plan description'),
        features: z.array(z.string()).describe('List of features included'),
        highlighted: z.boolean().default(false).describe('Whether this is the featured plan'),
        cta: z.string().default('Get Started').describe('CTA button text'),
    }),
});

/**
 * Content Collections Export
 * Export all collections for use in Astro pages
 */
export const collections = {
    features,
    testimonials,
    pricing,
};
