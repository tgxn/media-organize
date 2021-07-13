# media-organize

[![GitHub Issues](https://img.shields.io/github/issues/tgxn/media-organize.svg)](https://github.com/tgxn/media-organize/issues)
[![npm version](https://img.shields.io/npm/v/media-organize.svg)](https://www.npmjs.com/package/media-organize)
[![dependencies](https://img.shields.io/david/tgxn/media-organize.svg)](https://david-dm.org/tgxn/media-organize)
[![devDependencies](https://img.shields.io/david/dev/tgxn/media-organize.svg)](https://david-dm.org/bevry/media-organize#info=devDependencies)
[![license](https://img.shields.io/github/license/tgxn/media-organize.svg)](https://github.com/tgxn/media-organize/LICENSE)

A CLI utility for organizing your media collections via symbolic links.

✅ Auto-detect 📺 Series, 🐙 Anime and 🎬 Movies  
✅ No dependencies on external web services!  
✅ Extract Season/Episode Numbers  
✅ File Watcher 👀 links new files  
✅ Unlinks ❌ deleted files  
✅ Customizable Naming Format  
✅ Powerful [Nunjucks](https://github.com/mozilla/nunjucks) Templating  
✅ Multiple Directory Support  
✅ Logging & File Rotation

This plugin will **never** move or delete your media files, because that's your _(or your torrent client's)_ job!

## Installation

Requirements:

-   NodeJS 12+

#### Install from NPM

```bash
npm i -g media-organize
```

#### Install from Source

```bash
git clone https://github.com/tgxn/media-organize
cd media-organize
npm install -g .
```

## Usage

```
orgMedia

run media organization

Commands:
  orgMedia run    run media organization                               [default]
  orgMedia watch  start media watchers                              [aliases: w]

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -d, --data     app data directory            [string] [default: "~/.orgMedia"]
  -l, --log      enable logging to data directory      [boolean] [default: true]
  -q, --quiet    hide console log output              [boolean] [default: false]
```

### Automatic Methods

CRON _(Regular Runs)_  
`orgMedia`

Watcher/Screen _(creates a screen named `media_watcher` watching your media)_  
`screen -S media_watcher -dm orgMedia watch`

## Configuration

Config file is `config.json` and has the following mandatory properties:

| Option         | Purpose                           | Example               |
| -------------- | --------------------------------- | --------------------- |
| `directories`  | `Array` of directories to scan    | `["../series"]`       |
| `targetPath`   | Target directory for sorted files | `../sorted`           |
| `targetFormat` | Naming format of the output links | See below for details |

And the following non-mandatory options:

| Option               | Default | Purpose                                                                   |
| -------------------- | ------- | ------------------------------------------------------------------------- |
| `enabled`            | `true`  |                                                                           |
| `allowedExtensions`  | `*`     | `Array` Extension to allow, _(empty or omitted for all)_                  |
| `ignoredExtensions`  | _None_  | `Array` Extensions to ignore                                              |
| `linkSubtitles`      | `false` | Should subtitle files be copied alongside media files?                    |
| `subtitleExtensions` | _None_  | Extensions to link with media                                             |
| `useHighestQuality`  | `false` | Should a higher-quality release replace a lower one?                      |
| `strictType`         | _None_  | Whether this config block should only accept `movies` or `series`         |
| `allowedSize`        | _None_  | `Array` Minimum and Maximum (if required) file sizes, in MB. `[50, 5000]` |

You can also specify an array of config objects if you have different file types/directories to scan.

See [`config.example.json`](https://github.com/tgxn/media-organize/blob/master/config.example.json) for further example configurations.

##### `targetFormat` usable variables

This is a list of the basic metadata that should be available on each media item.

| Variable         | Value                                                | Example |
| ---------------- | ---------------------------------------------------- | ------- |
| `{{name}}`       | Series/Show/Movie Name                               | `Name`  |
| `{{season}}`     | Season Integer                                       | `10`    |
| `{{episode}}`    | Episode Integer                                      | `34`    |
| `{{year}}`       | Year Integer                                         | `2021`  |
| `{{extension}}`  | File Extension                                       | `.mkv`  |
| `{{classifier}}` | [Meta] The classifier used to detect the media type. |         |

#### `caseFormat` filter

This filter will automatically use the [Case](https://github.com/nbubna/Case) library to format a string.

Usage:  
`{{ name | caseFormat('capital') }}`

Example:  
`{{ 'foo_v_bar' | caseFormat('capital') }} -> 'Foo V Bar'`

#### `appendYear` filter

This filter will automatically append the year (in brackets) at the end of the given string.

Usage:  
`{{ name | appendYear }}`

Example:  
`{{ 'name' | appendYear }} -> 'name (2021)'`
