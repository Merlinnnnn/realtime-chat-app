import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessageById, getUsersForSideBar, sendMessageToId } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/user", protectRoute, getUsersForSideBar);
router.get("/:id", protectRoute, getMessageById);

router.post("/send/:id", protectRoute, sendMessageToId);

export default router;