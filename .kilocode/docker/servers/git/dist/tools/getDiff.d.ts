import { z } from "zod";
export declare const getDiffTool: {
    name: string;
    description: string;
    schema: {
        repoPath: z.ZodString;
        from: z.ZodOptional<z.ZodString>;
        to: z.ZodOptional<z.ZodString>;
        filePath: z.ZodOptional<z.ZodString>;
        cached: z.ZodOptional<z.ZodBoolean>;
    };
    handler: ({ repoPath, from, to, filePath, cached }: {
        repoPath: string;
        from?: string;
        to?: string;
        filePath?: string;
        cached?: boolean;
    }) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
//# sourceMappingURL=getDiff.d.ts.map