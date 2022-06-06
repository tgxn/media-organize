const Organize = require("../src/organize");

const configArray = require("../config.example.json");

let mockFileData = configArray;
jest.mock("fs", () => ({
    promises: {
        readFile: async () => {
            return JSON.stringify(mockFileData);
        },
        existsSync: jest.fn().mockResolvedValue(),
        mkdir: jest.fn().mockResolvedValue(),
        writeFile: jest.fn().mockResolvedValue(),
        readdir: jest
            .fn()
            .mockResolvedValue(["Get.Rich.Or.Die.Tryin.2005.1080p.BluRay.REMUX.AVC.TrueHD.5.1-UnKn0wn.mkv"]),
        stat: jest.fn().mockResolvedValue({ size: 123123123 })
    }
}));

let organize;
test("new Organize & loadConfig", async () => {
    organize = new Organize();
    await organize.loadConfig({
        dataPathString: "/tmp",
        enableFileLogs: false,
        quietConsole: false
    });

    expect(organize.dataLocations.config).toBe("/tmp/config.json");
    expect(organize.dataLocations.storage).toBe(`/tmp/storage.json`);
    expect(organize.dataLocations.logsDir).toBe(`/tmp/logs/`);
});

test("organizeAll", async () => {
    await organize.organizeAll();
});
