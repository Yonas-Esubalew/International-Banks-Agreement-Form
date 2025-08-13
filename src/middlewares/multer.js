import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({ storage });

export const uploadSingle = upload.single('image'); 
export const uploadMultiple = upload.array('images', 10); 
export const uploadSignature = upload.single("signature");
export const uploadPdf = upload.single("pdf");

export default upload;
