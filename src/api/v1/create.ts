import { Router } from "express";
import { nanoid } from "nanoid";

import db from "../../utils/db";

let nanoidLength = parseInt(process.env.NANOIDLENGTH || "6");

const forbiddenUids = process.env.FORBIDDEN_UIDS?.split(",") || [];

const router = Router();

router.get("/", async (req, res) => {
	const url = req.query.url?.toString();
	const uid = req.query.uid?.toString();
	const ipAddress = req.headers["cf-connecting-ip"]?.toString().split(",")[0];
	const authorUuid = req.headers["x-author-uuid"]?.toString() || req.headers["x-uuid"]?.toString();
	if (!url) {
		res.status(400).json({
			status: 400,
			message: "No URL provided",
		});
		return;
	}
	const result = await createShortUrl(url, ipAddress || "0.0.0.0", authorUuid, uid);
	if (result[0] === "success") {
		res.status(200).json({
			status: 200,
			message: "Successfully created short URL",
			url: `${process.env.BASE_URL}/${result[1]}`,
		});
		return;
	} else {
		switch (result[1]) {
			case "Invalid URL":
				res.status(400).json({
					status: 400,
					message: "Invalid URL",
				});
				return;
			case "UID already exists":
				res.status(409).json({
					status: 409,
					message: "UID already exists",
				});
				return;
			case "Failed to insert URL":
				res.status(500).json({
					status: 500,
					message: "Failed to insert URL",
				});
				return;
			default:
				res.status(500).json({
					status: 500,
					message: "An unknown error occurred",
				});
				return;
		}
	}
});

router.post("/", async (req, res) => {
	const url = req.body.url;
	const uid = req.body.uid;
	const ipAddress = req.headers["cf-connecting-ip"]?.toString().split(",")[0];
	const authorUuid = req.headers["x-author-uuid"] || req.headers["x-uuid"] || req.body.uuid;
	if (!url) {
		res.status(400).json({
			status: 400,
			message: "No URL provided",
		});
		return;
	}
	const result = await createShortUrl(url, ipAddress || "0.0.0.0", authorUuid, uid);
	if (result[0] === "success") {
		res.status(200).json({
			status: 200,
			message: "Successfully created short URL",
			url: `${process.env.BASE_URL}/${result[1]}`,
		});
		return;
	} else {
		switch (result[1]) {
			case "Invalid URL":
				res.status(400).json({
					status: 400,
					message: "Invalid URL",
				});
				return;
			case "UID already exists":
				res.status(409).json({
					status: 409,
					message: "UID already exists",
				});
				return;
			case "Failed to insert URL":
				res.status(500).json({
					status: 500,
					message: "Failed to insert URL",
				});
				return;
			default:
				res.status(500).json({
					status: 500,
					message: "An unknown error occurred",
				});
				return;
		}
	}
});

async function createShortUrl(url: string, ipAddress: string, authorUuid?: string, uid?: string): Promise<string[]> {
	// Normalize UID
	uid = uid?.replace(/[^a-zA-Z0-9_]/gi, "");

	// Check if UID is on the forbidden list
	if (uid && forbiddenUids.includes(uid)) {
		return ["error", "UID is forbidden"];
	}

	// Check if URL is valid
	try {
		new URL(url);
	} catch (error) {
		return ["error", "Invalid URL"];
	}

	// Check if customized UID is available
	const userSuppliedUid = uid;
	uid = uid || nanoid(nanoidLength);
	let checkUid = await checkUidAvailability(uid);
	if (!checkUid && userSuppliedUid) {
		return ["error", "UID already exists"];
	}

	// Generate random UID till we get a unique one
	if (!checkUid) {
		let rounds = 0;
		while (!checkUid) {
			if (rounds > 10) {
				nanoidLength++;
			}
			uid = nanoid(nanoidLength);
			checkUid = await checkUidAvailability(uid);
			rounds++;
		}
	}

	// Insert URL into database
	const insertUrlQuery = await db("INSERT INTO yals.addresses (url, uid, author_ip, author) VALUES ($1, $2, $3, $4)", [url, uid, ipAddress, authorUuid]);
	if (!insertUrlQuery.rowCount || insertUrlQuery.rowCount < 1) {
		return ["error", "Failed to insert URL"];
	}

	return ["success", uid];
}

async function checkUidAvailability(uid: string): Promise<boolean> {
	const checkUidQuery = await db("SELECT * FROM yals.addresses WHERE uid = $1", [uid]);
	if (checkUidQuery.rowCount && checkUidQuery.rowCount > 0) {
		return false;
	}
	return true;
}

export default router;
