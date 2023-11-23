# Dither Me This


Generate dithered images at build time for your static website.

Dither me this is just does the dithering.

Specific site generators will require different packages that use dither-me-this.

for sites built with 11ty see @11ty-dither

Dither me this takes an image and a set of options, and outputs a dithered image


## Installation

Install dither-me-this with npm and add it to your dev dependencies like so:

```
npm install dither-me-this --save-dev
```

## Usage

The code below shows an image being read from a file, dithered based on a set of options, then output as a new file.

```js
const dither = require("dither-me-this")
const fs = require('fs')

const options = {...}

fs.readFile("input.jpg", async (err, data) => {

    if (err) throw err

    const ditheredImage = await dither(data, options)

    fs.writeFile('output.png', ditheredImage, (err) => {

        if (err) throw err

    })

})
```

dither-me-this is a single function that takes two arguments:

1. The image you want to dither as a [`Buffer()`](https://nodejs.org/api/buffer.html#buffer_class_buffer) or [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)
2. An [`Object`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#objects) containing dithering options


## Options

`dither-me-this` has lots options. Any options left blank will fallback to the default.

Some options only apply to specific types of dithering.

```js

const options = {
    ditheringType: "errorDiffusion" // errorDiffusion, ordered, random, noDither

    // Error Diffusion Dithering options
    errorDiffusionMatrix: "floydSteinberg", // Keyword or matrix (not yet implemented)
    serpentine: false // NOT YET IMPLEMENTED

    // Ordered Dithering Options
    orderedType:'bayer', // No other option yet implemented
    orderedMatrix:[4, 4] // Minimum 1, maximum 8 ... for now

    // Random Dithering Options
    // Random Dithering shouldn't be used except for educational purposes
    randomDitheringType: "blackAndWhite",

    // Color Options
    palette: ["#000", "#fff"], // array of hex values, array of rgb values, or keyword for preset palette
    // preset palettes include: "default", "gameboy" and "sega master system"

    // Automatic Color Options
    sampleColorsFromImage:false,
    numberOfSampleColors:10

}

```

### `ditheringType` &lt;string&gt;

- `errorDiffusion` (default)
- `ordered`
- `random`
- `quantizationOnly` 

### Error Diffusion Options

These options only apply if `ditheringType` is set to `errorDiffusion`…

#### `errorDiffusionMatrix` &lt;string&gt;

Choose a preset error diffusion matrix or create your own (not yet implemented).

- `floydSteinberg` (default)
- `falseFloydSteinberg`
- `jarvis`
- `stucki`
- `burkes`
- `sierra3`
- `sierra2`
- `Sierra2-4A`

#### `serpentine` &lt;boolean&gt; (not yet implemented)

By default this is set to `false`, meaning the dithering algorithm iterates through each pixel, row by row, from left to right.

If set to `true` the algorithm will go change direction on every other row.

### Ordered Dithering Options

These options only apply if `ditheringType` is set to `ordered`…

#### `orderedType` &lt;string&gt; (default:'bayer')

There is currently only one option for this: `bayer`. Others may be added in the future.

#### `orderedMatrix` &lt[number, number]&gt; (default:[4,4])

The number of columns and rows respectively of the bayer matrix.

### `randomDitheringType` &lt;string&gt; (default:'blackAndWhite')

Either `blackAndWhite` or `rgb`. Random dithering ignores any other color options.

### palette &lt;string | string[] | number[3][]&gt; (default:["#000", "#FFF"])

The color palette of the dithered image.

Either a single string containing a keyword for a preset color palette, or an array of colors as hex or rgb values.

The default is black and white e.g. `["#000", "#FFF"]`

### `sampleColorsFromImage` &lt;boolean&gt; (default:false) 

if `true` dither-me-this will select colors from the input image and use them as the color palette. (any color palette settings will be ignored)

### `numberOfSampleColors` &lt;number&gt; (default:10) 

The amount of colors to sample from the input image if `sampleColorsFromImage` is set to `true`



## What and Why?

Dithering is a method of reducing the colors in an image and emulating the missing colors with strategically placed dots.

It's used to display images in print or on devices with a limited color range. 

It has the modern advantage of reducing the file size of images in a stylistic way.

To learn more [Wikipedia has a good article](https://en.wikipedia.org/wiki/Dither).

You can also play with the client-side version: [Dither Me This](https://doodad.dev/dither-me-this).

## Project Scope

dither-me-this will be built to work with static site generators, such as [11ty](https://www.11ty.dev/).

### The main goal

It should take an image in the form of an `<img>` tag with a source: 

`<img src="https://example.com/image">` or `<img src="./images/example.jpg">`

and some options such as a set of sizes, dithering options, and a color palette

and produces a set of dithered images in `webp` and `png` form and a `<picture>` element containing `<source>` elements pointing to those images.

**However,** Because static site generators all work differently. It's yet to be determined how this project will achieve that goal with each static site generator.

To achieve the main goal other packages will (probably) need to be made for each static site generator. Those packages will have this one as a dependency and deal with the particulars of that static site generator.

### Other Goals

- A wide range of dithering techniques, even ones that produce poor quality results.
- Quantize (reduce colors) to an arbirary color palette
- Sample colors from the target image to produce a color palette on the fly (this should produce the same color palette each time)
- Output to the terminal the amount of data saved by dithering
- Resizes images based on the options set

## Project Priorities

Before anything else... A good experience for the end user of the images.

Then, a good developer experience.

Then, readable code so others can learn from it.

Then, finally, the speed of the dithering itself. If an optimization makes it harder for someone to understand the code it won't be merged.


## Contributing

Feel free to contribute to this project. Remember the Project Priorities, and please follow the code of conduct.

### Pull Request Process

- Ensure any install or build dependencies are removed before the end of the layer when doing a build.
- Ensure your work is thoroughly tested, to the best of your abilities
- You may merge the Pull Request in once you have the sign-off from a maintainer



## Code of Conduct

See CODE_OF_CONDUCT.md