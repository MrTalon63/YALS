import pino from "pino";

let transport;

if (process.env.NODE_ENV === "production") {
	transport = pino.transport({
		target: "pino-loki",
		options: {
			batching: true,
			interval: 5,
			host: process.env.LOKI_HOST,
			basicAuth: {
				username: process.env.LOKI_USER,
				password: process.env.LOKI_PASS,
			},
			labels: {
				app: "YALS",
			},
		},
	});
} else {
	transport = pino.transport({
		target: "pino-pretty",
		options: {
			colorize: true,
			minimumLevel: "debug",
		},
	});
}

const logger = pino(transport);

export default logger;
