import pino from "pino";
import PinoPretty from "pino-pretty";

const logger = pino({
	transport: {
		target: "pino-pretty",
		options: {
			colorize: true,
			minimumLevel: "debug",
		},
	},
});

export default logger;
