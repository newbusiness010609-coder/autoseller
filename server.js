import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    const instructions = req.body.instructions || "Title, Description, Price";

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString("base64");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Analyze this image and respond ONLY using these categories:
${instructions}

Be structured, clean, and professional.`
              },
              {
                type: "input_image",
                image_base64: base64Image
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    res.json({
      result: data.output?.[0]?.content?.[0]?.text || "No response"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
