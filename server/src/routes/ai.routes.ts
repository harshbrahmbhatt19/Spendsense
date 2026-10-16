import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "@/middleware/auth";
import { validate } from "@/middleware/validate";
import { askAssistantSchema } from "@/validators/ai.validator";
import { ask, history, reset, scanReceipt } from "@/controllers/ai.controller";
import multer from "multer";

const router = Router();
router.use(requireAuth);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { success: false, message: "Too many requests to the assistant, slow down a little" },
});

const receiptUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype));
  },
});

router.post("/ask", aiLimiter, validate(askAssistantSchema), ask);
router.post("/scan-receipt", aiLimiter, receiptUpload.single("receipt"), scanReceipt);
router.get("/history", history);
router.delete("/history", reset);

export default router;
