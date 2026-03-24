import { z } from "zod";
export declare const switchBranchTool: {
    name: string;
    description: string;
    schema: {
        repoPath: z.ZodString;
        branchName: z.ZodString;
        create: z.ZodOptional<z.ZodBoolean>;
    };
    handler: ({ repoPath, branchName, create }: {
        repoPath: string;
        branchName: string;
        create?: boolean;
    }) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
//# sourceMappingURL=switchBranch.d.ts.map