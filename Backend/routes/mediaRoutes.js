import express from "express";
import OpenAI from "openai";

import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import cloudinary from "../utils/cloudinary.js";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/*
=========================
UPLOAD IMAGE
=========================
*/
router.post(
  "/upload-image",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const base64 =
        req.file.buffer.toString("base64");

      const uploaded =
        await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${base64}`,
          {
            folder: "maichat_uploads"
          }
        );

      res.json({
        imageUrl: uploaded.secure_url
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Upload failed"
      });
    }
  }
);

/*
=========================
AI IMAGE ANALYSIS / VISION
=========================
*/
router.post(
  "/analyze-image",
  authMiddleware,
  async (req, res) => {
    try {
      const { imageUrl } = req.body;

      const completion =
        await openai.chat.completions.create({
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image in detail."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ]
        });

      res.json({
        analysis:
          completion.choices[0].message.content
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Vision analysis failed"
      });
    }
  }
);

/*
=========================
GENERATE IMAGE
=========================
*/
router.post(
  "/generate-image",
  authMiddleware,
  async (req, res) => {
    try {
      const { prompt } = req.body;

      const image =
        await openai.images.generate({
          model: "gpt-image-1",
          prompt
        });

      res.json({
        imageUrl: image.data[0].url
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Image generation failed"
      });
    }
  }
);

export default router;
