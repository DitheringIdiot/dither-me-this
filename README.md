# Dither Me This

Generate dithered images at build time for your static website.

**this project is not ready for production**

## How to use it.

For now this project is not working with any static site generator.
But you can still test out the code:

1. Download the project

2. Install the dependencies:

```
npm install canvas fs-extra
```

3. Put images in the `input` folder

4. `npm run start` in your terminal

5. Dithered images are placed in the `output` folder


## What and Why?

Dithering is a method of reducing the colors in an image and emulating the missing colors with strategically placed dots.

It's used to display images in print or on devices with a limited color range. 

It has the modern advantage of reducing the file size of images in a stylistic way.

To learn more [Wikipedia has a good article](https://en.wikipedia.org/wiki/Dither).

You can also play with the client-side version: [Dither Me This](https://doodad.dev/dither-me-this).

## Project Scope

Static Dither will be built to work with static site generators, such as [11ty](https://www.11ty.dev/).

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
- Output both `png` and `webp`
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