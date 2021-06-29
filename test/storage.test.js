const path = require("path");
const { homedir } = require("os");

const Storage = require("../lib/storage");

// setup mocks
let mockFileData = {};
jest.mock("fs", () => ({
    promises: {
        mkdir: jest.fn().mockResolvedValue(),
        access: jest.fn().mockResolvedValue(),
        rename: jest.fn().mockResolvedValue(),
        writeFile: jest.fn().mockResolvedValue(),
        readFile: async () => {
            return JSON.stringify(mockFileData);
        },
    },
}));

let store;
test("load - good", () => {
    store = new Storage("/root/storeFile");
    return store.load().then(() => {
        expect(store.filename).toBe("/root/storeFile");
        expect(store.tempFilename).toBe(`/root/storeFile.tmp`);
    });
});

test("get - default", () => {
    const value = store.get("abc", "123");

    expect(value).toBe("123");
});
test("get - no default", () => {
    const value = store.get("abc");

    expect(value).toBe(null);
});
test("get - no key", () => {
    const run = () => {
        const value = store.get();
    };
    expect(run).toThrow(Error);
});

test("put", () => {
    const put = store.put("abc", "new-value!");

    const value = store.get("abc");
    expect(value).toBe("new-value!");
});
test("put - no value", () => {
    const run = () => {
        const put = store.put("novalue");
    };
    expect(run).toThrow(Error);
});
test("put - nothing", () => {
    const run = () => {
        const put = store.put();
    };
    expect(run).toThrow(Error);
});

test("remove - default", () => {
    const remove = store.remove("abc");

    const value = store.get("abc");
    expect(value).toBe(null);
});
test("remove - no key", () => {
    const run = () => {
        const remove = store.remove();
    };
    expect(run).toThrow(Error);
});

test("persistData", () => {
    return store.persistData();
});
