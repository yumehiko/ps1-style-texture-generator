import { useEffect, useRef } from 'react';
import type { ImageData } from '../types/image';

export const useCanvas = (processedImage: ImageData | null) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !processedImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = processedImage.width;
    canvas.height = processedImage.height;

    const imageData = new ImageData(
      processedImage.data,
      processedImage.width,
      processedImage.height
    );
    ctx.putImageData(imageData, 0, 0);
  }, [processedImage]);

  return canvasRef;
};