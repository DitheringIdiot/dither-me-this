function setPixel(image, pixelIndex, pixel) {
    image.data[pixelIndex] = pixel[0]
    image.data[pixelIndex + 1] = pixel[1]
    image.data[pixelIndex + 2] = pixel[2]
    image.data[pixelIndex + 3] = pixel[3]
}

function getPixel(image, pixelIndex) {
    const data = image.data
    return [data[pixelIndex], data[pixelIndex + 1], data[pixelIndex + 2], data[pixelIndex + 3]]
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

module.exports = {
    setPixel,
    getPixel,
    randomInteger
}