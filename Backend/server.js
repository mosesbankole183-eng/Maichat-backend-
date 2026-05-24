import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/chat", chatRoutes);

app.get("/", (req, res) => {

  res.json({
    message: "MAICHAT backend working"
  });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`Server running on ${PORT}`);

});
