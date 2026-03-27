const express = require("express");
const multer = require("multer");

const app = express();
const upload = multer();

app.use(express.static(".")); // serve frontend

// CORS fix
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    const instructions = req.body.instructions || "Title, Description, Price";
    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString("base64");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": "Bearer ${process.env.OPENAI_API_KEY}"
",
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

    const text =
      data.output?.[0]?.content?.[0]?.text ||
      data.output_text ||
      "No response";

    res.json({ result: text });

  } catch (err) {
    res.json({ result: "Something went wrong." });
  }
});

app.listen(3000, () => console.log("Server running 🚀"));
