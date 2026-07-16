import { Router, type IRouter } from "express";
import healthRouter    from "./health";
import devotionalRouter from "./devotional";
import explainRouter   from "./explain";
import wordRouter      from "./word";
import donationsRouter from "./donations";
import ttsRouter       from "./tts";
import transcribeRouter from "./transcribe";
import billingRouter    from "./billing";
import recognitionsRouter from "./recognitions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(devotionalRouter);
router.use(explainRouter);
router.use(wordRouter);
router.use(donationsRouter);
router.use(ttsRouter);
router.use(transcribeRouter);
router.use(billingRouter);
router.use(recognitionsRouter);

export default router;
