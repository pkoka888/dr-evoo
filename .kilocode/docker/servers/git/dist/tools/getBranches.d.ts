import { z } from "zod";
export declare const getBranchesTool: {
    name: string;
    description: string;
    schema: {
        repoPath: z.ZodString;
        all: z.ZodOptional<z.ZodBoolean>;
    };
    handler: ({ repoPath, all, }: {
        repoPath: string;
        all?: boolean;
    }) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
//# sourceMappingURL=getBranches.d.ts.map