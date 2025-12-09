const express = require("express");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();  // load env variables

const app = express();
app.use(cors());

//  Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//  Multer Cloudinary storage setup
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "frames",              // Cloudinary folder name
        allowed_formats: ["jpg", "png", "jpeg"]
    }
});

const upload = multer({ storage });

//  POST — upload frame
app.post("/upload-frame", upload.single("frame"), (req, res) => {
    try {
        return res.json({
            message: "Frame uploaded successfully!",
            url: req.file.path  // Cloudinary file URL
        });
    } catch (err) {
        return res.status(500).json({ error: "Upload failed" });
    }
});

//  GET — list all frames
app.get("/frames-list", async (req, res) => {
    try {
        const response = await cloudinary.search
            .expression("folder:frames")
            .sort_by("created_at", "desc")
            .execute();

        const urls = response.resources.map(img => img.secure_url);

        res.json(urls);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch frames" });
    }
});

//  DELETE — delete frame
app.delete("/delete-frame", async (req, res) => {
    const { public_id } = req.query; // pass public id

    if (!public_id) {
        return res.status(400).json({ message: "Missing public_id" });
    }

    try {
        await cloudinary.uploader.destroy(public_id);
        res.json({ message: "Frame deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});

// RUN SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running at " + PORT));
