import { z } from "zod";
export declare const readFileTool: {
    name: string;
    description: string;
    schema: {
        path: z.ZodString;
    };
    handler: ({ path }: {
        path: string;
    }) => Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
//# sourceMappingURL=readFile.d.ts.map