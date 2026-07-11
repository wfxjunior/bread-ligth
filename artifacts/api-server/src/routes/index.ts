import { Router, type IRouter } from "express";
import healthRouter    from "./health";
import devotionalRouter from "./devotional";
import explainRouter   from "./explain";
import donationsRouter from "./donations";
import ttsRouter       from "./tts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(devotionalRouter);
router.use(explainRouter);
router.use(donationsRouter);
router.use(ttsRouter);

export default router;
