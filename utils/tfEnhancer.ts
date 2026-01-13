
import * as tf from '@tensorflow/tfjs';
import { EnhanceConfig } from '../types';
import { loadImage } from './imageProcessor';

/**
 * Uses TensorFlow.js to upscale and sharpen an image.
 * Uses Bilinear interpolation for upscaling (safer availability) and a convolutional kernel for sharpening.
 */
export const enhanceImage = async (imageSrc: string, config: EnhanceConfig): Promise<string> => {
  // Ensure backend is ready (WebGL usually)
  await tf.ready();

  const img = await loadImage(imageSrc);
  
  // Note: tf.tidy cannot handle async operations inside it that rely on the tensors being disposed.
  // We calculate the tensor, get the data, and then dispose.
  // browser.toPixels is async, so we return the tensor from tidy, use it, then dispose it.
  
  const resultTensor = tf.tidy(() => {
    // 1. Convert Image to Tensor
    const tensor = tf.browser.fromPixels(img);

    // 2. Calculate new dimensions
    const [height, width] = tensor.shape;
    const newHeight = Math.round(height * config.scale);
    const newWidth = Math.round(width * config.scale);

    // 3. Upscale using Bilinear Interpolation
    // tf.image.resizeBicubic can be missing in some lightweight bundles.
    // tf.image.resizeBilinear is a standard op always available.
    const upscaled = tf.image.resizeBilinear(tensor, [newHeight, newWidth]);

    // 4. Apply Smart Sharpening via Convolution if sharpness > 0
    let result = upscaled;
    
    if (config.sharpness > 0) {
      // Normalize sharpness to 0-1 range for kernel calculation
      const s = config.sharpness / 50; // Scaling down effect
      
      // Create a Laplacian-style sharpening kernel
      const k = [
        [0, -s, 0],
        [-s, 1 + 4 * s, -s],
        [0, -s, 0]
      ];

      // TFJS conv2d expects shape [filterHeight, filterWidth, inDepth, outDepth]
      // We will split channels, apply 2d filter, and concat.
      
      const channels = tf.split(upscaled, 3, 2);
      // 4D tensor for filter: [row, col, inDepth, outDepth] -> [3, 3, 1, 1]
      const filter = tf.tensor4d(k.flat(), [3, 3, 1, 1]);
      
      const sharpChannels = channels.map(c => {
        // Expand dims to match conv2d input [batch, height, width, inChannels]
        const input = c.expandDims(0);
        const conved = tf.conv2d(input, filter, 1, 'same');
        return conved.squeeze([0]);
      });

      result = tf.concat(sharpChannels, 2);
      
      // Clip values to valid 0-255 range
      result = result.clipByValue(0, 255);
    }

    // Convert to Int32 for display
    return result.toInt();
  });

  try {
    const canvas = document.createElement('canvas');
    canvas.width = resultTensor.shape[1];
    canvas.height = resultTensor.shape[0];
    
    await tf.browser.toPixels(resultTensor as tf.Tensor3D, canvas);
    return canvas.toDataURL('image/png');
  } finally {
    // Clean up the tensor that escaped tidy
    resultTensor.dispose();
  }
};

// Wrapper to match the interface expected by App.tsx
export const processEnhancement = async (imageSrc: string, config: EnhanceConfig): Promise<string> => {
   return enhanceImage(imageSrc, config);
}
