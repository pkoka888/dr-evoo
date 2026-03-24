import { z } from "zod";
export declare const getFileMetadataTool: {
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
//# sourceMappingURL=getFileMetadata.d.ts.map