const fs = require("fs").promises;
const path = require("path");

const { OrganizerLayer } = require("../lib/organize");

const mockedStore = {
    findLinkWithSource: () => {},
    deleteLink: () => {},
    findLink: () => {},
    createLink: () => {},
};

const configArray = require("../config.example.json");

jest.mock("fs", () => ({
    promises: {
        readFile: jest.fn().mockResolvedValue({}),
        stat: jest.fn().mockResolvedValue({ size: 123123123 }),
    },
}));

test("isAllowedFile", async () => {
    let testResult;

    const organizeLayer = new OrganizerLayer(
        {
            store: mockedStore,
            configArray,
        },
        0,
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
            store: mockedStore,
            configArray,
        },
        0,
    );

    testResult = await organizeLayer.isMovieOrSeries(
        path.parse("Get.Rich.Or.Die.Tryin.2005.1080p.BluRay.REMUX.AVC.TrueHD.5.1-UnKn0wn.mkv"),
    );
    expect(testResult).toBe("movie");

    testResult = await organizeLayer.isMovieOrSeries(
        path.parse("Invincible.2021.S01E08.Where.I.Really.Come.From.1080p.AMZN.WEB-DL.DDP5.1.H.264-NTb.mkv"),
    );
    expect(testResult).toBe("series");

    testResult = await organizeLayer.isMovieOrSeries(
        path.parse("Highly.Questionable.2021.06.25.720p.HDTV.x264-NTb.mkv"),
    );
    expect(testResult).toBe("series");

    testResult = await organizeLayer.isMovieOrSeries("");
    expect(testResult).toBe(null);
});
