const express = require("express");
const app = express();

app.use(express.json());

app.post("/generate", async (req, res) => {
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: "Create a Vinted product listing with title, description and price in euros."
      })
    });

    const data = await response.json();

    res.json({ result: data.output[0].content[0].text });

  } catch (err) {
    res.json({ error: "Server error" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
