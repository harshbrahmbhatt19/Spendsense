import { Router } from "express";
import { requireAuth } from "@/middleware/auth";
import { list, markRead, markAllRead, remove } from "@/controllers/notification.controller";

const router = Router();
router.use(requireAuth);

router.get("/", list);
router.post("/read-all", markAllRead);
router.post("/:id/read", markRead);
router.delete("/:id", remove);

export default router;
