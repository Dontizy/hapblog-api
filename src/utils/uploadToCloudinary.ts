import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier'

const uploadToCloudinary = (file: Express.Multer.File) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'hapblog',
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
    });
};

export default uploadToCloudinary;