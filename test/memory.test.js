const path = require("path");
const { homedir } = require("os");

const Memory = require("../lib/memory");

// setup mocks
let storeObject = {};
jest.mock("../lib/storage", () => {
    return jest.fn().mockImplementation(() => {
        return {
            load: jest.fn().mockResolvedValue(),
            get: (key) => {
                return storeObject[key];
            },
            put: (key, value) => {
                storeObject[key] = value;
            }
        };
    });
});

let memory;
test("parses home dir storeFile", () => {
    memory = new Memory("~/storeFile");

    return memory.loadStore().then(() => {
        expect(memory.storageFileLocation).toBe(`${homedir}${path.sep}storeFile`);
        expect(memory.linkFiles).toStrictEqual({});
    });
});

test("findLink", () => {
    const link = memory.findLink("/123/abc");

    expect(link).toBe(null);
});

test("createLink", () => {
    memory.createLink("/123/abc", "/link/abc/123", {
        whoa: "cool"
    });

    expect(memory.linkFiles["/123/abc"].linkPath).toStrictEqual("/123/abc");

    expect(memory.linkFiles["/123/abc"].sourcePath).toStrictEqual("/link/abc/123");

    expect(memory.linkFiles["/123/abc"].metaData).toStrictEqual({
        whoa: "cool"
    });
});

test("findLink", () => {
    const link = memory.findLink("/123/abc");

    expect(link).toStrictEqual({
        linkPath: "/123/abc",
        metaData: { whoa: "cool" },
        sourcePath: "/link/abc/123"
    });
});

test("findLinkWithSource", () => {
    const link = memory.findLinkWithSource("/link/abc/123");

    expect(link).toStrictEqual({
        linkPath: "/123/abc",
        metaData: { whoa: "cool" },
        sourcePath: "/link/abc/123"
    });
});

test("deleteLink", () => {
    const link = memory.deleteLink("/123/abc");

    expect(memory.linkFiles["/123/abc"]).toBeUndefined();
});

test("findLink", () => {
    const link = memory.findLink("/123/abc");

    expect(link).toBe(null);
});
