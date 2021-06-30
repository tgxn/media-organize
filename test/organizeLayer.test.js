const fs = require("fs").promises;
const path = require("path");

const { OrganizerLayer } = require("../lib/organize");

const mockedMemory = {
    findLinkWithSource: () => {},
    deleteLink: () => {},
    findLink: () => {},
    createLink: () => {}
};

const mockConfigBasic = {
    directories: ["~/test/dir"],
    allowedExtensions: ["mkv"],
    targetPath: "../sorted/Series",
    targetFormat: "{nameOptYear}/Season {season}/Episode {episode}.{extension}"
};

jest.mock("fs", () => ({
    promises: {
        readFile: jest.fn().mockResolvedValue({}),
        mkdir: jest.fn().mockResolvedValue({}),
        symlink: jest.fn().mockResolvedValue({}),
        stat: jest.fn().mockResolvedValue({ size: 123123123 })
    }
}));

test("isAllowedFile", async () => {
    let testResult;

    const organizeLayer = new OrganizerLayer(
        {
            memory: mockedMemory,
            configArray: [mockConfigBasic]
        },
        0
    );

    testResult = await organizeLayer.isAllowedFile("yhjkjk.tmp");
    expect(testResult).toBe(false);

    testResult = await organizeLayer.isAllowedFile("fstgdh.mkv");
    expect(testResult).toBe(true);

    testResult = await organizeLayer.isAllowedFile("hrthwthaesrthaewthg");
    expect(testResult).toBe(null);

    testResult = await organizeLayer.isAllowedFile("");
    expect(testResult).toBe(null);
});

test("isMovieOrSeries", async () => {
    let testResult;

    const organizeLayer = new OrganizerLayer(
        {
            memory: mockedMemory,
            configArray: [mockConfigBasic]
        },
        0
    );

    testResult = await organizeLayer.isMovieOrSeries(
        path.parse("Get.Rich.Or.Die.Tryin.2005.1080p.BluRay.REMUX.AVC.TrueHD.5.1-UnKn0wn.mkv")
    );
    expect(testResult).toBe("movie");

    testResult = await organizeLayer.isMovieOrSeries(
        path.parse("Invincible.2021.S01E08.Where.I.Really.Come.From.1080p.AMZN.WEB-DL.DDP5.1.H.264-NTb.mkv")
    );
    expect(testResult).toBe("series");

    testResult = await organizeLayer.isMovieOrSeries(
        path.parse("Highly.Questionable.2021.06.25.720p.HDTV.x264-NTb.mkv")
    );
    expect(testResult).toBe("series");

    testResult = await organizeLayer.isMovieOrSeries("");
    expect(testResult).toBe(null);
});

const determineMediaInfo_organizeLayer = new OrganizerLayer(
    {
        memory: mockedMemory,
        configArray: [mockConfigBasic]
    },
    0
);

test("determineMediaInfo - series", async () => {
    let testResult;

    testResult = await determineMediaInfo_organizeLayer.determineMediaInfo(
        "Invincible.2021.S01E08.Where.I.Really.Come.From.1080p.AMZN.WEB-DL.DDP5.1.H.264-NTb.mkv",
        "series"
    );
    expect(testResult).toStrictEqual({
        codec: "x264",
        episode: 8,
        group: "NTb",
        name: "Invincible",
        quality: 1080,
        season: 1,
        source: "webdl",
        year: 2021
    });
});

test("determineMediaInfo - anime", async () => {
    let testResult;

    testResult = await determineMediaInfo_organizeLayer.determineMediaInfo(
        "[HorribleSubs] Drifters - 02 [1080p].mkv",
        "series"
    );
    expect(testResult).toStrictEqual({
        codec: undefined,
        episode: "02",
        group: "HorribleSubs",
        name: "Drifters",
        quality: "1080p",
        season: "00",
        source: undefined,
        year: null
    });
});

test("determineMediaInfo - movie", async () => {
    let testResult;

    testResult = await determineMediaInfo_organizeLayer.determineMediaInfo(
        "Get.Rich.Or.Die.Tryin.2005.1080p.BluRay.REMUX.AVC.TrueHD.5.1-UnKn0wn.mkv",
        "movie"
    );
    expect(testResult).toStrictEqual({
        codec: undefined,
        episode: null,
        group: "REMUX.AVC.TrueHD.5.1-UnKn0wn.mkv",
        name: "Get Rich Or Die Tryin",
        quality: "1080p",
        season: null,
        source: null,
        year: 2005
    });
});

test("formatSeriesPath", async () => {
    const organizeLayer = new OrganizerLayer(
        {
            memory: mockedMemory,
            configArray: [mockConfigBasic]
        },
        0
    );

    const outString = organizeLayer.formatSeriesPath(
        {
            name: "testing",
            year: 2011,
            season: 1,
            episode: 2
        },
        {
            ext: ".test"
        }
    );

    expect(outString).toBe("../sorted/Series/testing (2011)/Season 1/Episode 2.test");
});

test("createSymlink", async () => {
    const organizeLayer = new OrganizerLayer(
        {
            memory: mockedMemory,
            configArray: [mockConfigBasic]
        },
        0
    );

    await organizeLayer.createSymlink("/123/abc", "/link/abc/123", {
        whoa: "cool"
    });
});
