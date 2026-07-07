import { Router, type IRouter } from "express";
import healthRouter from "./health";
import devotionalRouter from "./devotional";

const router: IRouter = Router();

router.use(healthRouter);
router.use(devotionalRouter);

export default router;
