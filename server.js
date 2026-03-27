const express = require("express");
const multer = require("multer");

const app = express();
const upload = multer();

app.use(express.static("."));
app.use(express.json());

app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.json({ result: "❌ API key not set in Render." });
    }

    if (!req.file) {
      return res.json({ result: "❌ Please upload an image." });
    }

    const instructions = req.body.instructions || "Title, Description, Price";
    const base64Image = req.file.buffer.toString("base64");

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
                text: `You are an expert e-commerce seller.

Analyze this image and respond ONLY using these categories:

${instructions}

Make it clean, structured, and persuasive.`
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

    if (data.error) {
      return res.json({ result: "❌ " + data.error.message });
    }

    const text =
      data.output?.[0]?.content?.[0]?.text ||
      data.output_text ||
      "❌ No AI response.";

    res.json({ result: text });

  } catch (err) {
    console.log(err);
    res.json({ result: "❌ Server error." });
  }
});

app.listen(3000, () => console.log("🚀 Server running"));
