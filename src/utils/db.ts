import { Pool } from "pg";

import log from "./logger";

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

async function query(text: string, params?: any[]) {
	const start = Date.now();
	const res = await pool.query(text, params);
	const duration = Date.now() - start;
	log.child({ text, duration, rows: res.rowCount }).info("[PostgreSQL]: Executed query");
	return res;
}

export default query;
