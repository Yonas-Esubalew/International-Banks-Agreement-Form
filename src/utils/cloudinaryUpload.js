import cloudinary from "../config/Cloudinary.js";
import streamifier from "streamifier";

/** Upload any buffer to Cloudinary via stream. */
export function cloudinaryStreamUpload({ buffer, folder, resource_type = "image", public_id, overwrite = true }) {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder, resource_type, public_id, overwrite },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(upload);
  });
}

/** Upload base64 string (signature) or URL passthrough */
export async function cloudinaryUploadBase64({ base64, folder, resource_type = "image" }) {
  return cloudinary.uploader.upload(base64, { folder, resource_type });
}
