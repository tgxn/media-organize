const winston = require("winston");
require("winston-daily-rotate-file");

const logger = winston.createLogger({
    level: "info",
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console({
            // silent: true
        })
    ]
});

function createTransport(configOverrides) {
    return new winston.transports.DailyRotateFile({
        filename: "./logs/organize-%DATE%.log",
        datePattern: "YYYY-MM-DD-HH",
        maxSize: "20m",
        maxFiles: 10,
        ...configOverrides
    });
}

module.exports = logger;
module.exports.createTransport = createTransport;
