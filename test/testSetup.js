jest.mock("winston", () => ({
    format: {
        simple: jest.fn()
    },
    createLogger: jest.fn().mockReturnValue({
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        log: jest.fn()
    }),
    transports: {
        DailyRotateFile: jest.fn()
    }
}));

jest.mock("winston-daily-rotate-file", () => ({
    transports: {
        DailyRotateFile: () => {}
    }
}));
