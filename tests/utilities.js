const { createCanvas, Image, loadImage } = require('canvas')


async function bufferToImageData (buffer) {

    const image = await loadImage(buffer)
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, image.width, image.height)
    const imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height)
    return imagedata

}

function imageDataToBuffer (imageData) {

    console.log(imageData)

    const canvas = createCanvas(imageData.width, imageData.height)
    const ctx = canvas.getContext('2d')
    ctx.putImageData(imageData, 0, 0)
    const buffer = canvas.toBuffer()
    return buffer
    
}

module.exports = {
    bufferToImageData,
    imageDataToBuffer
}