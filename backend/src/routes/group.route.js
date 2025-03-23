import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { create } from "../controllers/groups.controller.js";


const router = express.Router();

router.post("/create", create);

export default router;