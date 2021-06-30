const winston = require("winston");
require("winston-daily-rotate-file");

const transport = new winston.transports.DailyRotateFile({
    filename: "./logs/organize-%DATE%.log",
    datePattern: "YYYY-MM-DD-HH",
    maxSize: "20m",
    maxFiles: 10
});

const logger = winston.createLogger({
    transports: [transport]
});

module.exports = logger;
