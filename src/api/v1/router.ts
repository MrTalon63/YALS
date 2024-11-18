import { Router } from "express";

import create from "./create";
import version from "./version";
import stats from "./stats";

const router = Router();

router.use("/create", create);
router.use("/version", version);
router.use("/stats", stats);

export default router;
