import express from "express";

import OpenAI from "openai";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post("/", async (req, res) => {

  try{

    const { message } = req.body;

    const completion =
      await openai.chat.completions.create({

        model:"gpt-4.1-mini",

        messages:[
          {
            role:"system",
            content:
              "You are MAICHAT, a smart futuristic AI assistant."
          },

          {
            role:"user",
            content:message
          }
        ]

      });

    const reply =
      completion.choices[0]
      .message.content;

    res.json({
      reply
    });

  }catch(error){

    console.log(error);

    res.status(500).json({
      reply:"AI server error."
    });

  }

});

export default router;
