const path = require("path");
const { homedir } = require("os");

const Config = require("../lib/config");

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

const mockConfigBasic = {
    directories: ["~/test/dir"],
    targetPath: "~/movies",
    targetFormat: "Movies/{nameOptYear}.{extension}",
};

test("loadAndValidateConfig invalid config data", () => {
    mockConfigData = {};
    return config.loadAndValidateConfig().catch((errors) => {
        expect(errors[0].toString()).toBe(
            `instance[0] requires property "directories"`,
        );
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

// test("createLink", () => {
//     store.createLink("/123/abc", "/link/abc/123", {
//         whoa: "cool",
//     });

//     expect(store.linkFiles["/123/abc"].linkPath).toStrictEqual("/123/abc");

//     expect(store.linkFiles["/123/abc"].sourcePath).toStrictEqual(
//         "/link/abc/123",
//     );

//     expect(store.linkFiles["/123/abc"].metaData).toStrictEqual({
//         whoa: "cool",
//     });
// });

// test("findLink", () => {
//     const link = store.findLink("/123/abc");

//     expect(link).toStrictEqual({
//         linkPath: "/123/abc",
//         metaData: { whoa: "cool" },
//         sourcePath: "/link/abc/123",
//     });
// });

// test("findLinkWithSource", () => {
//     const link = store.findLinkWithSource("/link/abc/123");

//     expect(link).toStrictEqual({
//         linkPath: "/123/abc",
//         metaData: { whoa: "cool" },
//         sourcePath: "/link/abc/123",
//     });
// });

// test("deleteLink", () => {
//     const link = store.deleteLink("/123/abc");

//     expect(store.linkFiles["/123/abc"]).toBeUndefined();
// });

// test("findLink", () => {
//     const link = store.findLink("/123/abc");

//     expect(link).toBe(null);
// });
