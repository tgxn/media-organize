const path = require("path");

const Parser = require("../lib/parser");

test("isMovieOrSeries", async () => {
    let testResult;

    testResult = await Parser.isMovieOrSeries(
        "Get.Rich.Or.Die.Tryin.2005.1080p.BluRay.REMUX.AVC.TrueHD.5.1-UnKn0wn.mkv"
    );
    expect(testResult).toBe("movie");

    testResult = await Parser.isMovieOrSeries(
        "Invincible.2021.S01E08.Where.I.Really.Come.From.1080p.AMZN.WEB-DL.DDP5.1.H.264-NTb.mkv"
    );
    expect(testResult).toBe("series");

    testResult = await Parser.isMovieOrSeries("Highly.Questionable.2021.06.25.720p.HDTV.x264-NTb.mkv");
    expect(testResult).toBe("series");

    testResult = await Parser.isMovieOrSeries("");
    expect(testResult).toBe(null);
});

test("determineMediaInfo - series", async () => {
    let testResult;

    testResult = await Parser.determineMediaInfo(
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

    testResult = await Parser.determineMediaInfo("[HorribleSubs] Drifters - 02 [1080p].mkv", "series");
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

    testResult = await Parser.determineMediaInfo(
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
