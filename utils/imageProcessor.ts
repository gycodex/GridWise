
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { SplitResult, CropData, BackgroundConfig } from '../types';

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
};

const getDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
  return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
};

export const processBackgroundRemoval = async (imageSrc: string, config: BackgroundConfig): Promise<string> => {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return imageSrc;

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const target = hexToRgb(config.targetColor);
  const threshold = (config.threshold / 100) * 441.67; // Max Euclidean distance in RGB is sqrt(3 * 255^2) approx 441.67

  const width = canvas.width;
  const height = canvas.height;

  if (config.removeOuterOnly) {
    // Flood fill logic
    const visited = new Uint8Array(width * height);
    const stack: [number, number][] = [];

    // Start from edges
    for (let x = 0; x < width; x++) {
      stack.push([x, 0]);
      stack.push([x, height - 1]);
    }
    for (let y = 0; y < height; y++) {
      stack.push([0, y]);
      stack.push([width - 1, y]);
    }

    while (stack.length > 0) {
      const [currX, currY] = stack.pop()!;
      const idx = (currY * width + currX);

      if (visited[idx]) continue;
      visited[idx] = 1;

      const pIdx = idx * 4;
      const dist = getDistance(data[pIdx], data[pIdx + 1], data[pIdx + 2], target.r, target.g, target.b);

      if (dist <= threshold) {
        data[pIdx + 3] = 0; // Make transparent
        
        // Add neighbors
        const neighbors = [[currX + 1, currY], [currX - 1, currY], [currX, currY + 1], [currX, currY - 1]];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited[ny * width + nx]) {
            stack.push([nx, ny]);
          }
        }
      }
    }
  } else {
    // Standard color replacement
    for (let i = 0; i < data.length; i += 4) {
      const dist = getDistance(data[i], data[i + 1], data[i + 2], target.r, target.g, target.b);
      if (dist <= threshold) {
        data[i + 3] = 0;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  
  if (config.smoothEdges) {
    // Very basic smoothing: Simple blur filter applied to alpha channel if thickness > 0
    ctx.filter = `blur(${config.smoothingThickness}px)`;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
        tempCtx.drawImage(canvas, 0, 0);
        return tempCanvas.toDataURL('image/png');
    }
  }

  return canvas.toDataURL('image/png');
};

export const cropImage = async (imageSrc: string, crop: CropData): Promise<string> => {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  
  const sx = crop.x * image.width;
  const sy = crop.y * image.height;
  const sWidth = crop.width * image.width;
  const sHeight = crop.height * image.height;

  canvas.width = sWidth;
  canvas.height = sHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(
    image,
    sx, sy, sWidth, sHeight,
    0, 0, sWidth, sHeight
  );

  return canvas.toDataURL('image/png');
};

export const splitImage = async (
  imageSrc: string,
  rows: number,
  cols: number,
  originalFilename: string,
  format: string = 'image/png',
  quality: number = 0.92,
  selectedIndices?: Set<number>
): Promise<void> => {
  const image = await loadImage(imageSrc);
  const tileWidth = image.width / cols;
  const tileHeight = image.height / rows;

  let ext = 'png';
  if (format === 'image/jpeg') ext = 'jpg';
  if (format === 'image/webp') ext = 'webp';

  const collectedFiles: { blob: Blob; name: string }[] = [];
  const promises: Promise<void>[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      if (selectedIndices && selectedIndices.size > 0 && !selectedIndices.has(index)) continue;

      const promise = new Promise<void>((resolve) => {
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = tileWidth;
        tileCanvas.height = tileHeight;
        const tileCtx = tileCanvas.getContext('2d');
        if (tileCtx) {
          tileCtx.drawImage(image, c * tileWidth, r * tileHeight, tileWidth, tileHeight, 0, 0, tileWidth, tileHeight);
          tileCanvas.toBlob((blob) => {
            if (blob) {
              const rowStr = (r + 1).toString().padStart(2, '0');
              const colStr = (c + 1).toString().padStart(2, '0');
              const name = `tile_${rowStr}_${colStr}.${ext}`;
              collectedFiles.push({ blob, name });
            }
            resolve();
          }, format, quality);
        } else resolve();
      });
      promises.push(promise);
    }
  }

  await Promise.all(promises);
  const saveAs = (FileSaver as any).saveAs || FileSaver;
  const baseName = originalFilename.split('.')[0];
  if (collectedFiles.length === 0) return;

  if (collectedFiles.length === 1) {
    saveAs(collectedFiles[0].blob, collectedFiles[0].name);
  } else {
    const zip = new JSZip();
    const folder = zip.folder(`split_${baseName}`);
    if (folder) collectedFiles.forEach(file => folder.file(file.name, file.blob));
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `split_${baseName}.zip`);
  }
};
