import { z } from "zod";
export declare const listDirectoryTool: {
    name: string;
    description: string;
    schema: {
        path: z.ZodString;
        pattern: z.ZodOptional<z.ZodString>;
    };
    handler: ({ path: dirPath, pattern }: {
        path: string;
        pattern?: string;
    }) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
//# sourceMappingURL=listDirectory.d.ts.map