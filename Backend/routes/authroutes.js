import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/*
=========================
REGISTER
=========================
*/
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      email,
      password
    } = req.body;

    const existingUser =
      await User.findOne({
        $or: [
          { email },
          { username }
        ]
      });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Registration failed"
    });
  }
});

/*
=========================
LOGIN
=========================
*/
router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    const user =
      await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: "Invalid credentials"
      });
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!validPassword) {
      return res.status(400).json({
        error: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Login failed"
    });
  }
});

export default router;
