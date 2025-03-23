import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar, getMessages, sendMessage, sendGroupMessage, getGroupMessages } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.get("/group/:id", protectRoute, getGroupMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.post("/send-group/:id", protectRoute, sendGroupMessage);

export default router;