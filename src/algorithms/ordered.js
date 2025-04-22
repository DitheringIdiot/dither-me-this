const { setPixel, getPixel, randomInteger } = require('../utilities')
const bayerMatrix = require('../functions/bayer-matrix')
const findClosestPaletteColor = require('../functions/find-closest-palette-color')



function orderedDitherPixelValue (pixel, coordinates, thresholdMap, threshold) {
    const factor = thresholdMap[coordinates[1] % thresholdMap.length][coordinates[0] % thresholdMap[0].length] / (thresholdMap.length * thresholdMap[0].length)
    return pixel.map(color => color + (factor * threshold))
}

function pixelXY (index, width) {
    return [index % width, Math.floor(index / width)]
}


function ordered (image, { colors, orderedDitheringMatrix }) {

    const thresholdMap = bayerMatrix([orderedDitheringMatrix[0], orderedDitheringMatrix[1]])

    let currentPixelIndex, newPixel, oldPixel

    const orderedDitherThreshold = 256 / 4

    for (currentPixelIndex = 0; currentPixelIndex <= image.data.length; currentPixelIndex += 4) {
        
        oldPixel = getPixel(image, currentPixelIndex)
        newPixel = orderedDitherPixelValue(oldPixel, pixelXY(currentPixelIndex / 4, image.width), thresholdMap, orderedDitherThreshold)
        newPixel = findClosestPaletteColor(newPixel, colors)
        setPixel(image, currentPixelIndex, newPixel)
    }

}


module.exports = ordered