const dither = require("../../src/index.js") // require "dither-me-this"
const fs = require('fs')

fs.readFile("examples/simple/input.jpg", async (err, data) => {

    if (err) throw err

    const ditheredImage = await dither(data)

    fs.writeFile('examples/simple/output.png', ditheredImage, (err) => {

        if (err) throw err

    })

})
