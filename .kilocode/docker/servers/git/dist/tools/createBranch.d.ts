import { z } from "zod";
export declare const createBranchTool: {
    name: string;
    description: string;
    schema: {
        repoPath: z.ZodString;
        branchName: z.ZodString;
        startPoint: z.ZodOptional<z.ZodString>;
    };
    handler: ({ repoPath, branchName, startPoint }: {
        repoPath: string;
        branchName: string;
        startPoint?: string;
    }) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
//# sourceMappingURL=createBranch.d.ts.map