import multer from "multer";

const random = Date.now().toString();

const storageFile = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "src/Resources/img")
    },
    filename: (req,file,cb) => {
        cb(null, `${random}-${file.originalname}`);
    }
})
const filterFile = (req,file,cb) => {
    if(file.mimetype.split("/")[1] === "png" || file.mimetype.split("/")[1] === "jpg" || file.mimetype.split("/")[1] === "jpeg"){
        cb(null, true)
    }
    else{
        cb(new Error("file not support"), false)
    }
}
const Upload = multer({
    storage: storageFile,
    fileFilter: filterFile
});

export default Upload;