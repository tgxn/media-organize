const OrganizerLayer = require("../lib/layer");

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
    targetFormat: "{{name|appendYear}}/Season {{season}}/Episode {{episode}}.{{extension}}"
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

test("formatSeriesPath - normal filter", async () => {
    const organizeLayer = new OrganizerLayer(
        {
            memory: mockedMemory,
            configArray: [
                {
                    ...mockConfigBasic,
                    targetFormat: "{{name|normal}}/Season {{season}}/Episode {{episode}}.{{extension}}"
                }
            ]
        },
        0
    );

    const outString = organizeLayer.formatSeriesPath(
        {
            name: `test!@#$%^&*()_{}:\"<>?-|\=+/\`~`,
            year: 2011,
            season: 1,
            episode: 2
        },
        {
            ext: ".test"
        }
    );

    expect(outString).toBe("../sorted/Series/test()_-~/Season 1/Episode 2.test");
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
