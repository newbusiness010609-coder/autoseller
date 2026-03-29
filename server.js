const express = require("express");
const multer = require("multer");

const app = express();
const upload = multer();

app.use(express.static("."));
app.use(express.json());

app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.json({ result: "❌ API key missing." });
    }

    if (!req.file) {
      return res.json({ result: "❌ Please upload an image." });
    }

    const instructions = req.body.instructions || "";
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
                text: `You are a professional e-commerce expert.

Analyze the product image and generate a clean, structured result.

FORMAT STRICTLY LIKE THIS:

=== PRODUCT OVERVIEW ===
Write one short, clear paragraph in simple English describing the product.

=== LISTING ===
Title:
Description:
Estimated Price Range (EUR):
Target Audience:
Marketing Angle:

=== SCORES (out of 10) ===
Demand:
Profit Potential:
Competition:
Virality Potential:

=== IMPROVEMENTS ===
Give short, actionable suggestions to improve selling.

=== INSIGHTS ===
Add any smart observations or opportunities.

IMPORTANT:
- Keep it clean and well spaced
- Use simple English
- Avoid long paragraphs
- Be practical and realistic
- Sound like a smart seller, not a robot`

${instructions}`
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

    if (data.error) {
      return res.json({ result: "❌ " + data.error.message });
    }

    const text =
      data.output?.[0]?.content?.[0]?.text ||
      data.output_text ||
      "❌ No response.";

    res.json({ result: text });

  } catch (err) {
    console.log(err);
    res.json({ result: "❌ Server error." });
  }
});

app.listen(3000, () => console.log("🚀 Server running"));
