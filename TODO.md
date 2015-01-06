# TODOs

### `life.js`
* two torus arrays for life grid, swap them and reuse while updating grid to reduce memory usage
* wrap life.js logic to Life class to avoid using globals in file

### UI
* stop on stop criterion (reached stable state or cellsAlive = 0)
* step controls (one step fw, rw)
* colorize births and deaths
* colorize "visited" cells (to show life spread)
* "endless" or dynamic field for full browser, floating controls

### the game
* life in a reverse mode (evolve -> regress)
* RLE reader