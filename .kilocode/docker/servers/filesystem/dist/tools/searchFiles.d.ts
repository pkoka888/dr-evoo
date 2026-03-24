import { z } from "zod";
export declare const searchFilesTool: {
    name: string;
    description: string;
    schema: {
        directory: z.ZodString;
        pattern: z.ZodString;
        maxResults: z.ZodOptional<z.ZodNumber>;
    };
    handler: ({ directory, pattern, maxResults }: {
        directory: string;
        pattern: string;
        maxResults?: number;
    }) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
//# sourceMappingURL=searchFiles.d.ts.map