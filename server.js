import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/suggest", async (req, res) => {
  const prompt = req.body.contents[0].parts[0].text;
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer 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"
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000
    }),
  });
  const data = await response.json();
  console.log("Groq raw:", JSON.stringify(data));
  res.json({ text: data.choices[0].message.content });
});

app.listen(3001, () => console.log("Proxy running on http://localhost:3001"));