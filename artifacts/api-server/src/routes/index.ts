import { Router, type IRouter } from "express";
import healthRouter from "./health";
import devotionalRouter from "./devotional";
import explainRouter from "./explain";

const router: IRouter = Router();

router.use(healthRouter);
router.use(devotionalRouter);
router.use(explainRouter);

export default router;
