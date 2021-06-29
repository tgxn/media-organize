const { Organize } = require("../lib/organize");

const configArray = require("../config.example.json");

const configLocations = {
    config: "./config.json",
    storage: "./data/storage.json",
};

let mockFileData = configArray;
jest.mock("fs", () => ({
    promises: {
        readFile: async () => {
            return JSON.stringify(mockFileData);
        },
        mkdir: jest.fn().mockResolvedValue(),
        writeFile: jest.fn().mockResolvedValue(),
        readdir: jest
            .fn()
            .mockResolvedValue(["Get.Rich.Or.Die.Tryin.2005.1080p.BluRay.REMUX.AVC.TrueHD.5.1-UnKn0wn.mkv"]),
        stat: jest.fn().mockResolvedValue({ size: 123123123 }),
    },
}));

let organize;
test("new Organize & loadConfig", async () => {
    organize = new Organize(configLocations);
    await organize.loadConfig();
});

test("organizeAll", async () => {
    await organize.organizeAll();
});
