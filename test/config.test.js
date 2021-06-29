const path = require("path");
const { homedir } = require("os");

const Config = require("../lib/config");

// setup mocks
let mockConfigData;
jest.mock("fs", () => ({
    promises: {
        mkdir: jest.fn().mockResolvedValue(),
        access: jest.fn().mockResolvedValue(),
        readFile: async () => {
            return JSON.stringify(mockConfigData);
        },
    },
}));

let config;
test("parses home dir", () => {
    config = new Config("~/configFile");
    expect(config.configPath).toBe(`${homedir}${path.sep}configFile`);
    expect(config.configArray).toStrictEqual([]);
});

test("doesn't parse home dir", () => {
    const config1 = new Config("/root/configFile");
    expect(config1.configPath).toBe(`/root/configFile`);
    expect(config1.configArray).toStrictEqual([]);
});

const mockConfigBasic = {
    directories: ["~/test/dir"],
    targetPath: "~/movies",
    targetFormat: "Movies/{nameOptYear}.{extension}",
};

test("loadAndValidateConfig invalid config data", () => {
    mockConfigData = {};
    return config.loadAndValidateConfig().catch((errors) => {
        expect(errors[0].toString()).toBe(`instance[0] requires property "directories"`);
    });
});

test("loadAndValidateConfig basic config object", () => {
    mockConfigData = mockConfigBasic;
    return config.loadAndValidateConfig().then((result) => {
        expect(result).toStrictEqual([mockConfigBasic]);
    });
});

test("loadAndValidateConfig basic config array", () => {
    mockConfigData = [
        mockConfigBasic,
        {
            ...mockConfigBasic,
            enabled: false,
        },
    ];
    return config.loadAndValidateConfig().then((result) => {
        expect(result).toStrictEqual([
            mockConfigBasic,
            {
                ...mockConfigBasic,
                enabled: false,
            },
        ]);
    });
});
