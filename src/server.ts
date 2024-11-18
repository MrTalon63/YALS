import express from "express";
import helmet from "helmet";
import PinoHttp from "pino-http";

import log from "./utils/logger";
import db from "./utils/db";

import router from "./api/router";

const app = express();

app.use(express.json());
app.use(helmet());
app.use(PinoHttp({ logger: log }));
app.set("trust proxy", true);

app.use("/api", router);

app.use(express.static("static"));

// Redirect all other routes to shortened URLs or 404
app.get("*", async (req, res) => {
	const uid = req.path.slice(1);
	if (!uid) {
		res.status(404).json({
			status: 404,
			message: "Not Found",
		});
	}
	// Redirect to full URL
	const result = await db("SELECT url FROM yals.addresses WHERE uid = $1", [uid]);
	if (!result.rowCount || result.rowCount < 1) {
		res.status(404).json({
			status: 404,
			message: "Not Found",
		});
		return;
	}
	res.redirect(301, result.rows[0].url);
	await db("UPDATE yals.addresses SET view_count = view_count + 1 WHERE uid = $1", [uid]);
	return;
});

app.listen(process.env.PORT || 3000, () => {
	log.info(`[Express]: Server is running on port ${process.env.PORT || 3000}`);
});
