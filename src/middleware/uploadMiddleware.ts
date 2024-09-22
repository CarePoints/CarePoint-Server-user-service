import multer from 'multer';
import { Request } from 'express';


const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        console.log('multer is',req.file)
        cb(null, 'uploads/'); 
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    console.log('multer is2',req.file)

    if (file.mimetype.startsWith('image/')) {
        cb(null, true); 
    } else {
        cb(new Error('Only image files are allowed!')); 
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

const uploadSingleImage = upload.single('photo');

export { uploadSingleImage };
