import express from "express";
import OpenAI from "openai";

import authMiddleware from "../middleware/authMiddleware.js";
import Conversation from "../models/Conversation.js";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/*
=========================
CREATE NEW CHAT
=========================
*/
router.post(
  "/new",
  authMiddleware,
  async (req, res) => {
    try {
      const convo =
        await Conversation.create({
          userId: req.user.id,
          messages: []
        });

      res.json(convo);

    } catch {
      res.status(500).json({
        error: "Failed to create conversation"
      });
    }
  }
);

/*
=========================
GET USER CHATS
=========================
*/
router.get(
  "/history",
  authMiddleware,
  async (req, res) => {
    const convos =
      await Conversation.find({
        userId: req.user.id
      }).sort({ createdAt: -1 });

    res.json(convos);
  }
);

/*
=========================
STREAM CHAT RESPONSE
=========================
*/
router.post(
  "/stream/:conversationId",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        message
      } = req.body;

      const convo =
        await Conversation.findOne({
          _id: req.params.conversationId,
          userId: req.user.id
        });

      if (!convo) {
        return res.status(404).json({
          error: "Conversation not found"
        });
      }

      convo.messages.push({
        role: "user",
        content: message
      });

      const stream =
        await openai.chat.completions.create({
          model: "gpt-4.1-mini",
          messages: convo.messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          stream: true
        });

      res.setHeader(
        "Content-Type",
        "text/plain; charset=utf-8"
      );

      res.setHeader(
        "Transfer-Encoding",
        "chunked"
      );

      let aiReply = "";

      for await (const chunk of stream) {
        const token =
          chunk.choices?.[0]?.delta?.content || "";

        if (token) {
          aiReply += token;
          res.write(token);
        }
      }

      convo.messages.push({
        role: "assistant",
        content: aiReply
      });

      await convo.save();

      res.end();

    } catch (err) {
      console.error(err);

      res.status(500).end(
        "Streaming failed"
      );
    }
  }
);
import authMiddleware from "../middleware/authMiddleware.js";

router.get(
  "/protected",
  authMiddleware,
  (req, res) => {
    res.json({
      message: "Access granted",
      user: req.user
    });
  }
);
export default router;
