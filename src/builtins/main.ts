import multer from "multer";

import type { FileName } from "../types/filename";

const upload = multer({ storage: multer.memoryStorage() });

const fileUploading = {
    defaultFileUpload: (NameForAccessingTheFile: FileName) => { return upload.single(NameForAccessingTheFile.value); },
    multipleFilesUpload: (NameForAccessingTheFiles: FileName, maxFilesCountAllowed: number) => { return upload.array(NameForAccessingTheFiles.value, maxFilesCountAllowed); },
};

export const builtIns = {
    middlewares: {
        fileUploading,
    },
};
