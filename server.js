const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.json());

app.post("/generate", async (req, res) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert reseller. Return: Title, Description, Price in euros."
          },
          {
            role: "user",
            content: "Generate a product listing."
          }
        ]
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error generating listing" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
