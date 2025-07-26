import { useEffect, useRef, useCallback } from 'react';
import type { ProcessedImageData } from '../types/image';

interface UseCanvasOptions {
  maxWidth?: number;
  maxHeight?: number;
  backgroundColor?: string;
}

export const useCanvas = (
  processedImage: ProcessedImageData | null,
  options: UseCanvasOptions = {}
) => {
  const {
    maxWidth = 512,
    maxHeight = 512,
    backgroundColor = '#0a0a0a'
  } = options;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const calculateDisplaySize = useCallback((
    imageWidth: number,
    imageHeight: number
  ) => {
    const widthScale = maxWidth / imageWidth;
    const heightScale = maxHeight / imageHeight;
    const scale = Math.min(widthScale, heightScale, 1);

    return {
      width: Math.floor(imageWidth * scale),
      height: Math.floor(imageHeight * scale),
      scale
    };
  }, [maxWidth, maxHeight]);

  const clearCanvas = useCallback((ctx: CanvasRenderingContext2D | null) => {
    if (!ctx) return;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }, [backgroundColor]);

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !processedImage) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const { width: displayWidth, height: displayHeight } = 
      calculateDisplaySize(processedImage.width, processedImage.height);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    clearCanvas(ctx);

    ctx.imageSmoothingEnabled = false;

    const imageData = new globalThis.ImageData(
      processedImage.data,
      processedImage.width,
      processedImage.height
    );

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCanvas.width = processedImage.width;
    tempCanvas.height = processedImage.height;
    tempCtx.putImageData(imageData, 0, 0);

    ctx.drawImage(
      tempCanvas,
      0,
      0,
      processedImage.width,
      processedImage.height,
      0,
      0,
      displayWidth,
      displayHeight
    );

    tempCanvas.width = 0;
    tempCanvas.height = 0;
  }, [processedImage, calculateDisplaySize, clearCanvas]);

  useEffect(() => {
    drawImage();
  }, [drawImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      requestAnimationFrame(drawImage);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    const parentElement = canvas.parentElement;
    
    if (parentElement) {
      resizeObserver.observe(parentElement);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [drawImage]);

  return canvasRef;
};