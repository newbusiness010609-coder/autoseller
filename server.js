const express = require("express");
const multer = require("multer");

const app = express();
const upload = multer();

app.use(express.static("."));
app.use(express.json());

app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    const email = req.body.email;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      return res.json({ result: "❌ Invalid user. Please login again." });
    }

    console.log("USER:", email);

    if (!process.env.OPENAI_API_KEY) {
      return res.json({ result: "API key missing." });
    }

    if (!req.file) {
      return res.json({ result: "Upload an image." });
    }

    const base64Image = req.file.buffer.toString("base64");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        max_output_tokens: 500,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `You are a professional e-commerce expert...`
              },
              {
                type: "input_image",
                image_url: `data:image/jpeg;base64,${base64Image}`
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    const text =
      data.output?.[0]?.content?.[0]?.text ||
      data.output_text ||
      "No response.";

    res.json({ result: text });

  } catch (err) {
    console.log(err);
    res.json({ result: "Server error." });
  }
});

app.listen(3000, () => console.log("🚀 Running"));
