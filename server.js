const express = require("express");
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

app.use(express.json());

const path = require("path");

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

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
        input: "Create a product listing with title, description and price."
      })
    });

    const data = await response.json();

   const text =
  data.output?.[0]?.content?.[0]?.text ||
  data.output_text ||
  JSON.stringify(data);

    res.json({ result: text });

  } catch (err) {
    res.json({ error: "Server error" });
  }
});

app.listen(3000, () => {
  console.log("Server running");
});
