import { Router } from "express";

import apiv1Router from "./v1/router";

const router = Router();

router.use("/v1", apiv1Router);

export default router;
