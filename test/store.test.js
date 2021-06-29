const fs = require("fs");
const path = require("path");
const { homedir } = require("os");

const Store = require("../lib/store");

jest.mock("fs");
fs.readFileSync = () => {
    return "{}";
};
let storeObject = {};
jest.mock("../lib/storage", () => {
    return jest.fn().mockImplementation(() => {
        return {
            get: (key) => {
                return storeObject[key];
            },
            put: (key, value) => {
                storeObject[key] = value;
            },
        };
    });
});

let store;
test("parses home dir", () => {
    store = new Store("~/testFile");
    expect(store.storageFileLocation).toBe(`${homedir}${path.sep}testFile`);
    expect(store.linkFiles).toStrictEqual({});
});

test("findLink", () => {
    const link = store.findLink("/123/abc");

    expect(link).toBe(null);
});

test("createLink", () => {
    store.createLink("/123/abc", "/link/abc/123", {
        whoa: "cool",
    });

    expect(store.linkFiles["/123/abc"].linkPath).toStrictEqual("/123/abc");

    expect(store.linkFiles["/123/abc"].sourcePath).toStrictEqual(
        "/link/abc/123",
    );

    expect(store.linkFiles["/123/abc"].metaData).toStrictEqual({
        whoa: "cool",
    });
});

test("findLink", () => {
    const link = store.findLink("/123/abc");

    expect(link).toStrictEqual({
        linkPath: "/123/abc",
        metaData: { whoa: "cool" },
        sourcePath: "/link/abc/123",
    });
});

test("findLinkWithSource", () => {
    const link = store.findLinkWithSource("/link/abc/123");

    expect(link).toStrictEqual({
        linkPath: "/123/abc",
        metaData: { whoa: "cool" },
        sourcePath: "/link/abc/123",
    });
});

test("deleteLink", () => {
    const link = store.deleteLink("/123/abc");

    expect(store.linkFiles["/123/abc"]).toBeUndefined();
});

test("findLink", () => {
    const link = store.findLink("/123/abc");

    expect(link).toBe(null);
});
