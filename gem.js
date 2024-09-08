const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");

const app = express();
const apiKey = "AIzaSyAPZF0mrSC-rgvUCLdeczbg2yXXWyvQngM";

// Set up multer to use memory storage
const upload = multer({ storage: multer.memoryStorage() });

const genAI = new GoogleGenerativeAI(apiKey);

app.use(cors());

// Route to handle image upload and disease prediction
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const imageBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    const imageData = imageBuffer.toString("base64"); // Convert buffer to base64 string

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageData,
          mimeType,
        },
      },
      {
        text: "Identify any plant diseases in this image and suggest possible solutions.Give the json object and nothing else , that json will have two key value pairs named - Disease:value , Cure:value. Dont return anything except the json object. and if there is no crop or crop disease cant be found return Disease:No plants found. Cure:No plants found. Make sure to always return json with only these two keys."
      },
    ]);
    
    res.send(result.response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while processing the image.");
  }
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
