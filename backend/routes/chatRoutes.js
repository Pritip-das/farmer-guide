import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// System Prompt: Defines the AI's persona and constraints
const SYSTEM_PROMPT = `
You are an expert agricultural assistant for a farmer's advisory application.
Your goal is to help farmers with crop diseases, weather impacts, and general farming advice.
1. Keep answers concise, practical, and easy for a farmer to understand.
2. If the question is not related to agriculture or weather, politely decline to answer.
3. Use metric units (Celsius, etc.).
`;

router.post('/ask', async (req, res) => {
  try {
    const userQuestion = req.body.question;

    // Initialize AI inside the route to ensure .env is loaded correctly
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    if (!userQuestion) {
      return res.status(400).json({ message: "Question is required" });
    }

    const fullPrompt = `${SYSTEM_PROMPT}\n\nFarmer asks: ${userQuestion}\nAssistant answer:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ answer: text });

  } catch (error) {
    console.error("AI Error:", error);

    // Handle "Too Many Requests" (429) - Free tier limit
    if (error.status === 429 || (error.message && error.message.includes("429"))) {
        return res.status(429).json({ 
            answer: "The Agri-Assistant is currently busy (Too many requests). Please wait 30 seconds and try again." 
        });
    }

    // Handle Safety Blocks
    if (error.message && error.message.includes("SAFETY")) {
        return res.status(200).json({ 
            answer: "I cannot answer that question due to safety guidelines." 
        });
    }

    // Handle Generic Errors
    res.status(500).json({ message: "Something went wrong connecting to the Agri-Assistant." });
  }
});

export default router;