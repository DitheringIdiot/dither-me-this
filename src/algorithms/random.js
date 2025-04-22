const { setPixel, getPixel, randomInteger } = require('../utilities')
// const findClosestPaletteColor = require('../functions/find-closest-palette-color')

function random (image, { colors }) {
 
    let currentPixelIndex, newPixel, oldPixel

    for (currentPixelIndex = 0; currentPixelIndex <= image.data.length; currentPixelIndex += 4) {

        oldPixel = getPixel(image, currentPixelIndex)
    
        // TODO - should this be replaced with white noise dithering, 
        // is that not essentially the same thing just with specific colors as the color pallete?

        // B&W version:
        // const averageRGB = (oldPixel[0] + oldPixel[1] + oldPixel[2]) / 3
        // newPixel = averageRGB < randomInteger(0, 255) ? [0, 0, 0, 255] : [255, 255, 255, 255]

        // Color version:
        newPixel = oldPixel.map(color => color < randomInteger(0, 255) ? 0 : 255)
        setPixel(image, currentPixelIndex, newPixel)

        
    }

}


module.exports = random