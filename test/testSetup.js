jest.mock("winston", () => ({
    format: {
        simple: jest.fn(),
        timestamp: jest.fn(),
        cli: jest.fn(),
        colorize: jest.fn(),
        combine: jest.fn()
    },
    transports: {
        Console: jest.fn(),
        DailyRotateFile: jest.fn()
    },
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    add: jest.fn()
}));

jest.mock("winston-daily-rotate-file", () => ({
    transports: {
        DailyRotateFile: () => {}
    }
}));
