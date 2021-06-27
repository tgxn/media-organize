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

## Setup / Run

1. Open `config.json` and configure to your liking:
  - Set directories to be scanned
  - Set the target directory for links
2. Start the scanner


## Modules Used
  
[skiptirengu / anitomy-js](https://github.com/skiptirengu/anitomy-js)  
[tregusti / episode-parser](https://github.com/tregusti/episode-parser)  
[broofa / mime](https://github.com/broofa/mime)  
[jzjzjzj / parse-torrent-name](https://github.com/jzjzjzj/parse-torrent-name)  
