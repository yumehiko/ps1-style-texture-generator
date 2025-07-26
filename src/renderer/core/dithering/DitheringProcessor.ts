export class DitheringProcessor {
  applyFloydSteinberg(imageData: ImageData, colors: number): ImageData {
    if (!imageData) {
      throw new Error('Invalid image data');
    }

    if (colors < 1 || colors > 256) {
      throw new Error('Color count must be between 1 and 256');
    }

    const width = imageData.width;
    const height = imageData.height;
    
    // Create a copy of the image data to work with
    const result = new ImageData(
      new Uint8ClampedArray(imageData.data),
      width,
      height
    );
    
    // Calculate color levels based on the number of colors
    const levels = colors - 1;
    
    // Process each pixel
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        // Process each color channel (R, G, B)
        for (let channel = 0; channel < 3; channel++) {
          const oldValue = result.data[index + channel];
          
          // Quantize the color value
          const newValue = Math.round(oldValue * levels / 255) * 255 / levels;
          result.data[index + channel] = newValue;
          
          // Calculate the error
          const error = oldValue - newValue;
          
          // Distribute the error to neighboring pixels using Floyd-Steinberg weights
          // Right pixel (7/16)
          if (x < width - 1) {
            const rightIndex = index + 4;
            result.data[rightIndex + channel] = Math.max(0, Math.min(255,
              result.data[rightIndex + channel] + error * 7 / 16
            ));
          }
          
          // Bottom-left pixel (3/16)
          if (y < height - 1 && x > 0) {
            const bottomLeftIndex = ((y + 1) * width + (x - 1)) * 4;
            result.data[bottomLeftIndex + channel] = Math.max(0, Math.min(255,
              result.data[bottomLeftIndex + channel] + error * 3 / 16
            ));
          }
          
          // Bottom pixel (5/16)
          if (y < height - 1) {
            const bottomIndex = ((y + 1) * width + x) * 4;
            result.data[bottomIndex + channel] = Math.max(0, Math.min(255,
              result.data[bottomIndex + channel] + error * 5 / 16
            ));
          }
          
          // Bottom-right pixel (1/16)
          if (y < height - 1 && x < width - 1) {
            const bottomRightIndex = ((y + 1) * width + (x + 1)) * 4;
            result.data[bottomRightIndex + channel] = Math.max(0, Math.min(255,
              result.data[bottomRightIndex + channel] + error * 1 / 16
            ));
          }
        }
      }
    }
    
    return result;
  }
}