const path = require("path");
const express = require("express");
const router = express.Router();

// ✅ VIDEO DOWNLOAD API
router.get("/download", (req, res) => {
    const videoPath = path.join(__dirname, "..", "videos", "sample.mp4");

    res.download(videoPath, "sample.mp4", (err) => {
        if (err) {
            console.error("❌ Error downloading video:", err);
            res.status(500).json({ success: false, message: "Something went wrong" });
        }
    });
});

module.exports = router;


