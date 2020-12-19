const fs = require('fs-extra')
const { createCanvas, Image } = require('canvas')
const colorPaletteFromImage = require('./functions/color-palette-from-image')
const utilities = require('./functions/utilities')
const colorHelpers = require('./functions/color-helpers')

const palettes = require('./data/palettes.json')
const diffusionMaps = require('./data/diffusion-maps.js')
const thresholdMaps = require('./data/threshold-maps.json')
const bayerMatrix = require('./functions/bayer-matrix.js')


const inputPath = './input'
const outputPath = './output'

const defaultPalette = [[0, 0, 0], [255, 255, 255]]

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



fs.readdir(inputPath, (err, files) => {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err)
    }
    //listing all files using forEach
    files.forEach((file) => {
        // Do whatever you want to do with the file
        getDataFromFile(file)
    })
})


const getDataFromFile = (file) => {
    fs.readFile(`${inputPath}/${file}`, (err, data) => {
        if (err) throw err
        createCanvasFromImageBuffer(data, file)
    })
}


const createCanvasFromImageBuffer = (buffer, filename) => {
    let img = new Image
    img.src = buffer
    // Initialiaze a new Canvas with the same dimensions
    // as the image, and get a 2D drawing context for it.
    let canvas = createCanvas(img.width, img.height)
    let ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, img.width, img.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const ditheredImageData = dither(imageData)
    ctx.putImageData(ditheredImageData, 0, 0)
    const dataURL = canvas.toDataURL()

    writeFileFromDataURL(dataURL, outputPath, filename)
}

const writeFileFromDataURL = (data, path, filename) => {
    let base64Image = data.split(';base64,').pop() // Apparently this needs to be done.
    fs.outputFile(`${path}/${filename}`, base64Image, { encoding: 'base64' })
}

const dither = (image) => {
    if (!image) {
        return
    }

    const width = image.width


    let colorPalette

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

        //console.log(Math.floor(((current / 4) / width)))
        let currentRow = Math.floor(((current / 4) / width))
        //let currentPixel = options.serpentine && Math.floor(((image.data.length / 4) / width)) ?
        let currentPixel = current // TODO - add serpentine values
        oldPixel = getPixelColorValues(currentPixel, image.data)

        // if (current < 300) {
        //     console.log(currentRow % 2 === 0)
        //     console.log(currentPixel)
        // }

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

const findClosestPaletteColor = (pixel, colorPalette) => {

    const colors = colorPalette.map(color => {
        return {
            distance: distanceInColorSpace(color, pixel),
            color
        }
    })

    let closestColor
    colors.forEach(color => {
        if (!closestColor) {
            closestColor = color
        } else {
            if (color.distance < closestColor.distance) {
                closestColor = color
            }
        }
    })

    if (!closestColor.color[3]) {
        closestColor.color.push(255) // if no alpha value is present add it.
    }

    return closestColor.color
}


const distanceInColorSpace = (color1, color2) => { // Currenlty ignores alpha


    // Luminosity needs to be accounted for, otherwise everything gets too dark.
    // var lumR = .2126,
    //     lumG = .7152,
    //     lumB = .0722

    // const max = 255

    // const averageMax = Math.sqrt(lumR * max * max + lumG * max * max + lumB * max * max) // I Dont understand this

    let r = color1[0] - color2[0]
    let g = color1[1] - color2[1]
    let b = color1[2] - color2[2]

    let distance = Math.sqrt(r * r + g * g + b * b)
    return distance
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


// const createBayerMatrix = (size) => {
//     // First Create Empty 2D array
//     let matrix = Array.from(Array.from(null.repeat(size[0])).repeat(size[1]))
//     matrix[0][0] = 0 // Set 0 in top left corner
//     let i
//     for (i = 1; n === size[0] * size[1] - 1; n++) {

//     }
// }