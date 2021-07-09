const path = require("path");
const { homedir } = require("os");

const Config = require("../lib/config");

// setup mocks
let mockFileData;
jest.mock("fs", () => ({
    promises: {
        mkdir: jest.fn().mockResolvedValue(),
        existsSync: jest.fn().mockResolvedValue(),
        access: jest.fn().mockResolvedValue(),
        readFile: async () => {
            return JSON.stringify(mockFileData);
        }
    }
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
    targetFormat: "Movies/{nameOptYear}.{extension}"
};

test("loadAndValidateConfig invalid config data", () => {
    mockFileData = {};
    return config.loadAndValidateConfig().catch((errors) => {
        expect(errors[0].stack).toEqual(`instance requires property "directories"`);
    });
});

class TaskConfig {
    constructor(configData) {
        this.configData = configData;
    }
}

test("loadAndValidateConfig basic config object", async () => {
    mockFileData = mockConfigBasic;
    const result = await config.loadAndValidateConfig();
    expect(result).toEqual([
        new TaskConfig({
            directories: ["~/test/dir"],
            targetFormat: "Movies/{nameOptYear}.{extension}",
            targetPath: "~/movies"
        })
    ]);
});

test("loadAndValidateConfig basic config array", () => {
    mockFileData = [
        mockConfigBasic,
        {
            ...mockConfigBasic,
            enabled: false
        }
    ];
    return config.loadAndValidateConfig().then((result) => {
        expect(result).toEqual([
            new TaskConfig(mockConfigBasic),
            new TaskConfig({
                ...mockConfigBasic,
                enabled: false
            })
        ]);
    });
});
