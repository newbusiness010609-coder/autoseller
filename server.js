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
                text: `You are a top-tier e-commerce expert.

Analyze the product image and generate:
- Title
- Description
- Estimated Price Range (EUR)
- Target Audience
- Marketing Angle

Then give scores (/10) for:
- Demand
- Profit Potential
- Competition
- Virality Potential

Finally, suggest improvements or missing info that would help sell better. Ask follow-up questions ONLY if useful.

Be natural, insightful, and non-robotic.

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
