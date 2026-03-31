const express = require("express");
const multer = require("multer");

const app = express();
const upload = multer();

app.use(express.static("."));
app.use(express.json());

app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    // 📧 GET USER EMAIL (FROM FRONTEND LOGIN)
    const email = req.body.email;

    // 📧 VALIDATE EMAIL FORMAT
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      return res.json({ result: "❌ Invalid user. Please login again." });
    }

    // 🧠 LOG USER (FOR NOW)
    console.log("USER:", email);

    // 🔑 CHECK OPENAI KEY
    if (!process.env.OPENAI_API_KEY) {
      return res.json({ result: "❌ API key missing." });
    }

    // 📸 CHECK IMAGE
    if (!req.file) {
      return res.json({ result: "❌ Please upload an image." });
    }

    // 📸 CONVERT IMAGE TO BASE64
    const base64Image = req.file.buffer.toString("base64");

    // 🤖 CALL OPENAI
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
                text: `You are a professional e-commerce expert.

Analyze the product image and respond in a CLEAN, VISUAL, and EASY TO READ format using emojis and spacing.

FORMAT EXACTLY LIKE THIS:

📦 **PRODUCT OVERVIEW**
Write one short, simple paragraph.

💰 **LISTING**
**Title:** ...
**Estimated Price:** ...
**Target Audience:** ...
**Selling Angle:** ...

📊 **SCORES**
**Demand:** X/10
**Profit Potential:** X/10
**Competition:** X/10
**Virality:** X/10

🛠 **IMPROVEMENTS**
- Bullet point
- Bullet point

🧠 **INSIGHTS**
Short smart observation.

❓ **SMART QUESTIONS**
Ask 2 useful questions:
- Ask what price user bought it for
- Ask if they want to resell or keep

⭐ **AUTOSELLER RATING**
Give a final score out of 10 with a short reason.

IMPORTANT:
- Use emojis exactly like above
- Use bold formatting with **
- Keep spacing clean
- Use simple English
- Be practical and realistic
- Base pricing on EU market (eBay, Amazon, Shopify)`
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

    // 📊 GET RESPONSE
    const data = await response.json();

    // 🧠 EXTRACT TEXT SAFELY
    const text =
      data.output?.[0]?.content?.[0]?.text ||
      data.output_text ||
      "❌ No response.";

    // 📤 SEND BACK RESULT
    res.json({ result: text });

  } catch (err) {
    console.log("ERROR:", err);

    res.json({
      result: "❌ Server error. Please try again."
    });
  }
});

// 🚀 START SERVER
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
