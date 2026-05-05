import express from "express";
import OpenAI from "openai";
import Replicate from "replicate";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

/*
=========================
TEXT TO SPEECH
=========================
*/
router.post(
  "/tts",
  authMiddleware,
  async (req, res) => {
    try {
      const { text } = req.body;

      const speech =
        await openai.audio.speech.create({
          model: "gpt-4o-mini-tts",
          voice: "alloy",
          input: text
        });

      const buffer =
        Buffer.from(await speech.arrayBuffer());

      res.setHeader("Content-Type", "audio/mpeg");
      res.send(buffer);

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "TTS failed"
      });
    }
  }
);

/*
=========================
SPEECH TO TEXT
=========================
*/
router.post(
  "/stt",
  authMiddleware,
  async (req, res) => {
    try {
      // Frontend uploads audio file URL/base64
      const { audioUrl } = req.body;

      res.json({
        transcript:
          "Implement audio file upload pipeline for Whisper input"
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "STT failed"
      });
    }
  }
);

/*
=========================
AI VIDEO GENERATION
=========================
*/
router.post(
  "/generate-video",
  authMiddleware,
  async (req, res) => {
    try {
      const { prompt } = req.body;

      const output =
        await replicate.run(
          "cjwbw/animatediff:1531004ee4c98894ab11f7e0f15d2df6c81e29fefcd6fc1f06f9f9b7e7dfdb6b",
          {
            input: {
              prompt
            }
          }
        );

      res.json({
        videoUrl: output
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Video generation failed"
      });
    }
  }
);

export default router;
