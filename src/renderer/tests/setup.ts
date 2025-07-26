import '@testing-library/jest-dom'

// Polyfill for ImageData in Node.js environment
class ImageDataPolyfill {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  colorSpace = 'srgb';

  constructor(
    arg1: number | Uint8ClampedArray, 
    arg2?: number, 
    arg3?: number
  ) {
    if (typeof arg1 === 'number') {
      // new ImageData(width, height)
      this.width = arg1;
      this.height = arg2!;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    } else {
      // new ImageData(data, width, height)
      this.data = new Uint8ClampedArray(arg1);
      this.width = arg2!;
      this.height = arg3!;
    }
  }
}

// Set global ImageData if it doesn't exist
if (typeof global.ImageData === 'undefined') {
  global.ImageData = ImageDataPolyfill as unknown as typeof ImageData;
}