import { Router, type IRouter } from "express";
import healthRouter    from "./health";
import devotionalRouter from "./devotional";
import explainRouter   from "./explain";
import donationsRouter from "./donations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(devotionalRouter);
router.use(explainRouter);
router.use(donationsRouter);

export default router;
