const { setPixel, getPixel } = require('../utilities')
const findClosestPaletteColor = require('../functions/find-closest-palette-color')
const diffusionMaps = require('../data/diffusion-maps')

function getQuantError (oldPixel, newPixel) {
    let quant = oldPixel.map((color, i) => {
        return color - newPixel[i]
    })
    return quant
}

function addQuantError (pixel, quantError, diffusionFactor) {
     return pixel.map((color, i) => color + (quantError[i] * diffusionFactor))
}

function error_diffusion (image, { colors, errorDiffusionMatrix }) {

    const diffusionMap = diffusionMaps[errorDiffusionMatrix]() || diffusionMaps['floydSteinberg']()

    let currentPixelIndex, newPixel, oldPixel, quantError

    for (currentPixelIndex = 0; currentPixelIndex <= image.data.length; currentPixelIndex += 4) {
        
        oldPixel = getPixel(image, currentPixelIndex)
        newPixel = findClosestPaletteColor(oldPixel, colors)
        setPixel(image, currentPixelIndex, newPixel)
        quantError = getQuantError(oldPixel, newPixel)

        diffusionMap.forEach(diffusion => {
            let pixelOffset = (diffusion.offset[0] * 4) + (diffusion.offset[1] * 4 * image.width)
            let pixelIndex = currentPixelIndex + pixelOffset
            if (!image.data[pixelIndex]) { // Check if pixel exists e.g. on the edges
                return
            }
            const errorPixel = addQuantError(getPixel(image, pixelIndex), quantError, diffusion.factor)
            setPixel(image, pixelIndex, errorPixel)
        })

    }

}


module.exports = error_diffusion