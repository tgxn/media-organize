const winston = require("winston");
const { format } = require("winston");
require("winston-daily-rotate-file");

function addFileTransport(configOverrides) {
    winston.add(
        new winston.transports.DailyRotateFile({
            filename: "./logs/organize-%DATE%.log",
            datePattern: "YYYY-MM-DD-HH",
            maxSize: "20m",
            maxFiles: 10,
            format: format.combine(format.timestamp(), format.simple()),
            ...configOverrides
        })
    );
}

function addConsoleTransport(configOverrides) {
    winston.add(
        new winston.transports.Console({
            format: format.combine(format.colorize(), format.cli(), format.simple()),
            ...configOverrides
        })
    );
}

module.exports = winston;
module.exports.addFileTransport = addFileTransport;
module.exports.addConsoleTransport = addConsoleTransport;
