import { Router } from "express";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("../../../package.json");

const router = Router();

router.get("/", (req, res) => {
	res.json({
		status: 200,
		version: pkg.version,
	});
});

export default router;
