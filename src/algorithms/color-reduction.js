const { setPixel, getPixel } = require('../utilities')
const findClosestPaletteColor = require('../functions/find-closest-palette-color')


function color_reduction (image, {colors}) {
 
    let currentPixelIndex, newPixel, oldPixel

    for (currentPixelIndex = 0; currentPixelIndex <= image.data.length; currentPixelIndex += 4) {

        oldPixel = getPixel(image, currentPixelIndex)
    
        newPixel = findClosestPaletteColor(oldPixel, colors)
        setPixel(image, currentPixelIndex, newPixel)

    }

}


module.exports = color_reduction