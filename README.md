# media-organizer

Something like Filebot but in nodejs and not crap.
Still WIP, but series symlinking is working.

This plugin will never move your media files, because that's your _(or your torrent client's)_ job!

## Features

- Identify Series/Show/Anime Name
- Identify Season/Episode Numbers
- Create symlinks to the specified target
- Standard Naming convention for shows/series
- Support for [Jellyfin](https://jellyfin.org/) naming

## Configuration

Config file is `config.json` and has the following properties:

`directories`: `Array` of directories to scan
`allowedExtensions`: `Array` of extension to allow, _(empty or omitted for all)_
`targetPath`: Target for sorted fils
`seriesCaseFormat`: Optional, a property of the [Case](https://www.npmjs.com/package/case) library
`targetFormat`: Format of the output symlinks

You can also specify an array of config objects if you have different file types/directories to scan

### `targetFormat` formatter variables

- `name`
- `nameOptYear`
- `season`
- `episode`
- `year`
- `extension`


## Run

`nvm use 14`
`node run.js`

## Modules Used
  
[skiptirengu / anitomy-js](https://github.com/skiptirengu/anitomy-js)  
[tregusti / episode-parser](https://github.com/tregusti/episode-parser)  
[broofa / mime](https://github.com/broofa/mime)  
[jzjzjzj / parse-torrent-name](https://github.com/jzjzjzj/parse-torrent-name)  
