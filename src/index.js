const palettes = require('./data/default-palettes.json')
const diffusionMaps = require('./data/diffusion-maps.js')
const thresholdMaps = require('./data/threshold-maps.json')

/* Functions */
const bayerMatrix = require('./functions/bayer-matrix')
const colorHelpers = require('./functions/color-helpers')
const colorPaletteFromImage = require('./functions/color-palette-from-image')
const utilities = require('./functions/utilities')
const findClosestPaletteColor = require('./functions/find-closest-palette-color')

const options = {
    dither: 'errorDiffusion', // ordered, random, errorDiffusion, non
    random: 'blackAndWhite', // blackAndWhite, Color 
    ordered: {
        type: 'bayer',
        matrix: [4, 4]
    },
    errorDiffusion: {
        type: 'Sierra2-4A'
    },
    palette: 'default', // color[], 'palette name'
    threshold: 50,
    serpentine: false,
    numberOfColors: 10
}

const dither = (image /* ImageData */) => {

    if (!image) {
        return
    }

    const width = image.width
    let colorPalette = []

    if (!options.palette || options.palette === 'default') {
        colorPalette = colorPaletteFromImage(image, options.numberOfColors)
    } else {
        colorPalette = setColorPalette(options.palette)
    }



    function setPixel (pixelIndex, pixel) {
        image.data[pixelIndex] = pixel[0]
        image.data[pixelIndex + 1] = pixel[1]
        image.data[pixelIndex + 2] = pixel[2]
        image.data[pixelIndex + 3] = pixel[3]
    }

    const thresholdMap = bayerMatrix([options.ordered.matrix[0], options.ordered.matrix[1]])


    let current, newPixel, quantError, oldPixel

    for (current = 0; current <= image.data.length; current += 4) {

        let currentPixel = current
        oldPixel = getPixelColorValues(currentPixel, image.data)

        if (!options.dither || options.dither === 'none') {
            newPixel = findClosestPaletteColor(oldPixel, colorPalette)
            setPixel(currentPixel, newPixel)
        }


        if (options.dither === 'randomDither') {
            newPixel = randomDitherPixelValue(oldPixel)
            setPixel(currentPixel, newPixel)
        }

        if (options.dither === 'randomDitherBlackAndWhite') {
            newPixel = randomDitherBlackAndWhitePixelValue(oldPixel)
            setPixel(currentPixel, newPixel)
        }


        if (options.dither === 'ordered') {
            const orderedDitherThreshold = 256 / 4
            newPixel = orderedDitherPixelValue(oldPixel, pixelXY(currentPixel / 4, width), thresholdMap, orderedDitherThreshold)
            newPixel = findClosestPaletteColor(newPixel, colorPalette)
            setPixel(currentPixel, newPixel)
        }

        const diffusionMap = diffusionMaps[options.errorDiffusion.type]() || diffusionMaps['floydSteinberg']()
        if (options.dither === 'errorDiffusion') {
            newPixel = findClosestPaletteColor(oldPixel, colorPalette)

            setPixel(currentPixel, newPixel)

            quantError = getQuantError(oldPixel, newPixel)

            diffusionMap.forEach(diffusion => {
                let pixelOffset = (diffusion.offset[0] * 4) + (diffusion.offset[1] * 4 * width)
                let pixelIndex = currentPixel + pixelOffset
                if (!image.data[pixelIndex]) { // Check if pixel exists e.g. on the edges
                    return
                }
                const errorPixel = addQuantError(getPixelColorValues(pixelIndex, image.data), quantError, diffusion.factor)
                setPixel(pixelIndex, errorPixel)
            })
        }
    }

    return image

}


const getPixelColorValues = (pixelIndex, data) => {
    return [data[pixelIndex], data[pixelIndex + 1], data[pixelIndex + 2], data[pixelIndex + 3]]
}

const getQuantError = (oldPixel, newPixel) => {
    //const maxValue = 255
    let quant = oldPixel.map((color, i) => {
        return color - newPixel[i]
    })

    return quant
}

const addQuantError = (pixel, quantError, diffusionFactor) => {
    return pixel.map((color, i) => color + (quantError[i] * diffusionFactor))
}


const randomDitherPixelValue = (pixel) => {
    return pixel.map(color => color < utilities.randomInteger(0, 255) ? 0 : 255)
}

const randomDitherBlackAndWhitePixelValue = (pixel) => {
    const averageRGB = (pixel[0] + pixel[1] + pixel[2]) / 3
    return averageRGB < utilities.randomInteger(0, 255) ? [0, 0, 0, 255] : [255, 255, 255, 255]
}

const orderedDitherPixelValue = (pixel, coordinates, thresholdMap, threshold) => {
    const factor = thresholdMap[coordinates[1] % thresholdMap.length][coordinates[0] % thresholdMap[0].length] / (thresholdMap.length * thresholdMap[0].length)
    return pixel.map(color => color + (factor * threshold))
}

const pixelXY = (index, width) => {
    return [index % width, Math.floor(index / width)]
}


const setColorPalette = (palette) => {
    let paletteArray = typeof palette === 'string' ? palettes[palette] : palette
    return paletteArray.map(color => colorHelpers.hexToRgb(color))
}

module.exports = dither