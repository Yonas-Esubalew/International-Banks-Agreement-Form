import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadSignature = upload.single("signature");
export const uploadPdf = upload.single("file");

export default upload;

