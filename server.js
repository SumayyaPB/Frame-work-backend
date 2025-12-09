const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

/*  CORS Setup */
app.use(cors({
    origin: "https://frame-setup.netlify.app/",                
    methods: "GET,POST,DELETE",
    allowedHeaders: "Content-Type"
}));

// Serve uploaded frames publicly
app.use("/frames", express.static("uploads/frames"));

// STORAGE SETTINGS
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads/frames/");
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

const upload = multer({ storage });

//  POST — admin uploads frame
app.post("/upload-frame", upload.single("frame"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({ message: "Frame uploaded successfully!" });
});

//  GET — return all frames
app.get("/frames-list", (req, res) => {
    fs.readdir("uploads/frames", (err, files) => {
        if (err) return res.status(500).json({ error: "Folder read error" });
        res.json(files);
    });
});

//  DELETE — delete selected frame
app.delete("/delete-frame/:filename", (req, res) => {
    const filePath = path.join("uploads/frames", req.params.filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return res.json({ message: "Frame deleted successfully" });
    } else {
        return res.status(404).json({ message: "File not found" });
    }
});

// RUN SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
