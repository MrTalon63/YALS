import { Router } from "express";

import db from "../../utils/db";

const router = Router();

router.get("/", async (req, res) => {
	const shortenedUrls = await db("SELECT COUNT(*) FROM yals.addresses");
	const totalViews = await db("SELECT SUM(view_count) FROM yals.addresses");

	res.status(200).json({
		status: 200,
		shortenedUrls: parseInt(shortenedUrls.rows[0].count),
		totalViews: parseInt(totalViews.rows[0].sum),
	});
});

export default router;
