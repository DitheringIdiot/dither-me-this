const palettes = require('./data/default-palettes.json')
const diffusionMaps = require('./data/diffusion-maps.js')
const thresholdMaps = require('./data/threshold-maps.json')

/* Functions */
const bayerMatrix = require('./functions/bayer-matrix')
const colorHelpers = require('./functions/color-helpers')
const colorPaletteFromImage = require('./functions/color-palette-from-image')
const utilities = require('./functions/utilities')
const findClosestPaletteColor = require('./functions/find-closest-palette-color')
const { createCanvas, Image, loadImage } = require('canvas')

const defaultOptions = {
    ditheringType: "errorDiffusion",

    errorDiffusionMatrix: "floydSteinberg",
    serpentine: false,

    orderedDitheringType: 'bayer',
    orderedDitheringMatrix: [4, 4],

    randomDitheringType: "blackAndWhite",

    palette: 'default',

    sampleColorsFromImage: false,
    numberOfSampleColors: 10
}



const dither = async (imageBuffer, opts) => {


    if (!imageBuffer) {
        return
    }

    const image = await imageDataFromBuffer(imageBuffer)

    const options = { ...defaultOptions, ...opts }



    const width = image.width
    let colorPalette = []

    if (!options.palette || options.sampleColorsFromImage === true) {
        colorPalette = colorPaletteFromImage(image, options.numberOfSampleColors)
    } else {
        colorPalette = setColorPalette(options.palette)
    }



    function setPixel (pixelIndex, pixel) {
        image.data[pixelIndex] = pixel[0]
        image.data[pixelIndex + 1] = pixel[1]
        image.data[pixelIndex + 2] = pixel[2]
        image.data[pixelIndex + 3] = pixel[3]
    }

    const thresholdMap = bayerMatrix([options.orderedDitheringMatrix[0], options.orderedDitheringMatrix[1]])


    let current, newPixel, quantError, oldPixel

    for (current = 0; current <= image.data.length; current += 4) {

        let currentPixel = current
        oldPixel = getPixelColorValues(currentPixel, image.data)

        if (!options.ditheringType || options.ditheringType === 'quantizationOnly') {
            newPixel = findClosestPaletteColor(oldPixel, colorPalette)
            setPixel(currentPixel, newPixel)
        }


        if (options.ditheringType === 'random' && options.randomDitheringType === 'rgb') {
            newPixel = randomDitherPixelValue(oldPixel)
            setPixel(currentPixel, newPixel)
        }

        if (options.ditheringType === 'random' && options.randomDitheringType === 'blackAndWhite') {
            newPixel = randomDitherBlackAndWhitePixelValue(oldPixel)
            setPixel(currentPixel, newPixel)
        }


        if (options.ditheringType === 'ordered') {
            const orderedDitherThreshold = 256 / 4
            newPixel = orderedDitherPixelValue(oldPixel, pixelXY(currentPixel / 4, width), thresholdMap, orderedDitherThreshold)
            newPixel = findClosestPaletteColor(newPixel, colorPalette)
            setPixel(currentPixel, newPixel)
        }

        const diffusionMap = diffusionMaps[options.errorDiffusionMatrix]() || diffusionMaps['floydSteinberg']()
        if (options.ditheringType === 'errorDiffusion') {
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




    return imageDataToBuffer(image)

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

const imageDataFromBuffer = async (buffer) => {

    const image = await loadImage(buffer)
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, image.width, image.height)
    const imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height)
    return imagedata

}

const imageDataToBuffer = (imageData) => {
    const canvas = createCanvas(imageData.width, imageData.height)
    const ctx = canvas.getContext('2d')
    ctx.putImageData(imageData, 0, 0)
    const buffer = canvas.toBuffer()
    return buffer
}

module.exports = dither