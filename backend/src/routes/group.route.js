import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { create, getGroups, getFriends, checkFriendship, addGroupMembers, updateGroupImage } from "../controllers/groups.controller.js";

const router = express.Router();

router.post("/create", protectRoute, create);
router.post("/:groupId/add-members", protectRoute, addGroupMembers);
router.get("/get-groups", protectRoute, getGroups);
router.get("/friends", protectRoute, getFriends);
router.get("/check-friendship/:otherUserId", protectRoute, checkFriendship);
router.put("/:groupId/image", protectRoute, updateGroupImage);

export default router;