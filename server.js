const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

app.post("/save", (req, res) => {
  console.log("📌 Save request received");

  let imageData = req.body.image;
  console.log("🖼 Base64 length:", imageData?.length);

  if (!imageData) return res.status(400).send("No image sent");

  let base64Data = imageData.replace(/^data:image\/png;base64,/, "");

  let fileName = `framed_${Date.now()}.png`;
  let filePath = path.join(__dirname, "gallery", fileName);

  fs.writeFile(filePath, base64Data, { encoding: "base64" }, (err) => {
    if (err) {
      console.log("❌ File Saving Error:", err);
      return res.status(500).send("Failed to save image");
    }
    console.log("✔ Saved:", fileName);
    res.send("Saved successfully → gallery/" + fileName);
  });
});


app.listen(4000, () => console.log("Backend running on port 4000"));
