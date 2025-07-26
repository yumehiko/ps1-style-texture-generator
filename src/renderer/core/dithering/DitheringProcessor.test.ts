import { describe, it, expect, beforeEach } from 'vitest';
import { DitheringProcessor } from './DitheringProcessor';

describe('DitheringProcessor', () => {
  let processor: DitheringProcessor;

  beforeEach(() => {
    processor = new DitheringProcessor();
  });

  describe('Floyd-Steinberg dithering', () => {
    it('should apply Floyd-Steinberg dithering to a simple gradient', () => {
      // Create a simple 4x4 gradient image data
      const width = 4;
      const height = 4;
      const imageData = new ImageData(width, height);
      
      // Fill with gradient from black to white
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          const value = Math.floor((x + y * width) * 255 / (width * height));
          imageData.data[index] = value;     // R
          imageData.data[index + 1] = value; // G
          imageData.data[index + 2] = value; // B
          imageData.data[index + 3] = 255;   // A
        }
      }

      const colors = 2; // Black and white only
      const result = processor.applyFloydSteinberg(imageData, colors);

      // Verify the result is valid ImageData
      expect(result).toBeInstanceOf(ImageData);
      expect(result.width).toBe(width);
      expect(result.height).toBe(height);

      // Verify all pixels are either black (0) or white (255)
      for (let i = 0; i < result.data.length; i += 4) {
        const value = result.data[i];
        expect(value === 0 || value === 255).toBe(true);
        // All channels should have the same value
        expect(result.data[i + 1]).toBe(value);
        expect(result.data[i + 2]).toBe(value);
        expect(result.data[i + 3]).toBe(255); // Alpha should remain 255
      }
    });

    it('should handle single color (solid) images', () => {
      const width = 3;
      const height = 3;
      const imageData = new ImageData(width, height);
      
      // Fill with middle gray
      const grayValue = 128;
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = grayValue;     // R
        imageData.data[i + 1] = grayValue; // G
        imageData.data[i + 2] = grayValue; // B
        imageData.data[i + 3] = 255;       // A
      }

      const colors = 2;
      const result = processor.applyFloydSteinberg(imageData, colors);

      // The dithering should create a pattern, not all same color
      let blackCount = 0;
      let whiteCount = 0;
      
      for (let i = 0; i < result.data.length; i += 4) {
        if (result.data[i] === 0) blackCount++;
        else if (result.data[i] === 255) whiteCount++;
      }

      // For middle gray, we expect a mix of black and white pixels
      expect(blackCount).toBeGreaterThan(0);
      expect(whiteCount).toBeGreaterThan(0);
    });

    it('should preserve pure black and white pixels', () => {
      const width = 2;
      const height = 2;
      const imageData = new ImageData(width, height);
      
      // Create checkerboard pattern
      imageData.data[0] = 0;    // Top-left: black
      imageData.data[1] = 0;
      imageData.data[2] = 0;
      imageData.data[3] = 255;

      imageData.data[4] = 255;  // Top-right: white
      imageData.data[5] = 255;
      imageData.data[6] = 255;
      imageData.data[7] = 255;

      imageData.data[8] = 255;  // Bottom-left: white
      imageData.data[9] = 255;
      imageData.data[10] = 255;
      imageData.data[11] = 255;

      imageData.data[12] = 0;   // Bottom-right: black
      imageData.data[13] = 0;
      imageData.data[14] = 0;
      imageData.data[15] = 255;

      const colors = 2;
      const result = processor.applyFloydSteinberg(imageData, colors);

      // Pure black and white should remain unchanged
      expect(result.data[0]).toBe(0);    // Top-left should stay black
      expect(result.data[4]).toBe(255);  // Top-right should stay white
      expect(result.data[8]).toBe(255);  // Bottom-left should stay white
      expect(result.data[12]).toBe(0);   // Bottom-right should stay black
    });

    it('should handle different color counts', () => {
      const width = 4;
      const height = 4;
      const imageData = new ImageData(width, height);
      
      // Create gradient
      for (let i = 0; i < imageData.data.length; i += 4) {
        const value = Math.floor((i / 4) * 255 / (width * height));
        imageData.data[i] = value;
        imageData.data[i + 1] = value;
        imageData.data[i + 2] = value;
        imageData.data[i + 3] = 255;
      }

      // Test with different color counts
      const colorCounts = [2, 4, 8, 16];
      
      for (const colors of colorCounts) {
        const result = processor.applyFloydSteinberg(imageData, colors);
        
        // Count unique gray values
        const uniqueValues = new Set<number>();
        for (let i = 0; i < result.data.length; i += 4) {
          uniqueValues.add(result.data[i]);
        }
        
        // Should have at most 'colors' unique values
        expect(uniqueValues.size).toBeLessThanOrEqual(colors);
        expect(uniqueValues.size).toBeGreaterThan(0);
      }
    });

    it('should handle edge case of 1x1 image', () => {
      const imageData = new ImageData(1, 1);
      imageData.data[0] = 128;
      imageData.data[1] = 128;
      imageData.data[2] = 128;
      imageData.data[3] = 255;

      const colors = 2;
      const result = processor.applyFloydSteinberg(imageData, colors);

      expect(result.width).toBe(1);
      expect(result.height).toBe(1);
      // Should be either black or white
      expect(result.data[0] === 0 || result.data[0] === 255).toBe(true);
    });

    it('should not modify the original image data', () => {
      const width = 2;
      const height = 2;
      const imageData = new ImageData(width, height);
      
      // Fill with gray
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 128;
        imageData.data[i + 1] = 128;
        imageData.data[i + 2] = 128;
        imageData.data[i + 3] = 255;
      }

      // Create a copy of original data
      const originalData = new Uint8ClampedArray(imageData.data);

      const colors = 2;
      processor.applyFloydSteinberg(imageData, colors);

      // Original should remain unchanged
      for (let i = 0; i < imageData.data.length; i++) {
        expect(imageData.data[i]).toBe(originalData[i]);
      }
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid color count', () => {
      const imageData = new ImageData(2, 2);
      
      expect(() => processor.applyFloydSteinberg(imageData, 0)).toThrow();
      expect(() => processor.applyFloydSteinberg(imageData, -1)).toThrow();
      expect(() => processor.applyFloydSteinberg(imageData, 257)).toThrow();
    });

    it('should throw error for invalid image data', () => {
      expect(() => processor.applyFloydSteinberg(null as unknown as ImageData, 2)).toThrow();
      expect(() => processor.applyFloydSteinberg(undefined as unknown as ImageData, 2)).toThrow();
    });
  });
});