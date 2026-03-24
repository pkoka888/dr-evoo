import { z } from "zod";
export declare const getCommitHistoryTool: {
    name: string;
    description: string;
    schema: {
        repoPath: z.ZodString;
        limit: z.ZodOptional<z.ZodNumber>;
        branch: z.ZodOptional<z.ZodString>;
        since: z.ZodOptional<z.ZodString>;
        until: z.ZodOptional<z.ZodString>;
    };
    handler: ({ repoPath, limit, branch, since, until }: {
        repoPath: string;
        limit?: number;
        branch?: string;
        since?: string;
        until?: string;
    }) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
//# sourceMappingURL=getCommitHistory.d.ts.map