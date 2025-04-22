const dither = require("../src/index.js") // require "dither-me-this"
const fs = require('fs')
const { bufferToImageData, imageDataToBuffer } = require('./utilities')


fs.readFile("tests/input.jpg", async (err, buffer) => {

    if (err) throw err

    const imageData = await bufferToImageData(buffer)

    const ditheredImage = dither(imageData, {
        type:'color_reduction',
        palette:[[0,0,0], [100, 0, 100], [255,255,255]]
    })

    const ditheredImageBuffer = imageDataToBuffer(ditheredImage)

    fs.writeFile('tests/outputs/color-reduction.png', ditheredImageBuffer, (err) => {

        if (err) throw err

    })

})
