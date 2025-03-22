import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { addFriend, changeStatus } from "../controllers/friends.controller.js";

const router = express.Router();

router.post("/request", addFriend);
router.post("/change-status", changeStatus);
export default router;