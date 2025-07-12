import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { addFriend, changeStatus, getFriendRequests } from "../controllers/friends.controller.js";

const router = express.Router();

router.post("/request", protectRoute, addFriend);
router.get("/requests", protectRoute, getFriendRequests);
router.post("/change-status", protectRoute, changeStatus);
export default router;