const palettes = require('./data/default-palettes.json')
const { color_reduction, random, ordered, error_diffusion } = require('./algorithms')
const defaults = require('./data/defaults')

const dither = (image, opts) => {

    if (!image) {
        return
    }

    const options = { ...defaults, ...opts }

    // Throw Error - if the palette is a string but doesn't exist in the defaults
    // Throw Error - if pallette array is empty 
    options.colors = typeof options.palette === 'string' ? palettes[options.palette] : options.palette

    if(options.type === 'color_reduction') {
        color_reduction(image, options)
    }

    if(options.type === 'random') {
        random(image, options)
    }

    if(options.type === 'ordered') {
        ordered(image, options)
    }

    if(options.type === 'error_diffusion') {
        error_diffusion(image, options)
    }

    return image

}

module.exports = dither