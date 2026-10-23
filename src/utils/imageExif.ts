/**
 * Image EXIF & Metadata Parser
 * Inspects JPEG/PNG metadata headers for camera hardware profiles and synthetic generation tags.
 */

import { ImageMetadataInfo, ImageAuthenticityLabel } from '../types';

export async function analyzeImageMetadata(file: File | Blob): Promise<ImageMetadataInfo> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  let cameraMake: string | undefined;
  let cameraModel: string | undefined;
  let softwareDetected: string | undefined;
  let dateTime: string | undefined;
  let hasExifCameraData = false;
  const technicalIndicators: string[] = [];

  // Inspect JPEG APP1 EXIF segment (0xFF 0xE1)
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
    let offset = 2;
    while (offset < bytes.length - 4) {
      if (bytes[offset] !== 0xFF) break;
      const marker = bytes[offset + 1];

      // Stop if image scan starts (SOS)
      if (marker === 0xDA || marker === 0xD9) break;

      const length = (bytes[offset + 2] << 8) | bytes[offset + 3];

      // APP1 Marker (EXIF or XMP)
      if (marker === 0xE1 && length > 8) {
        const header = String.fromCharCode(...bytes.slice(offset + 4, offset + 8));
        if (header.startsWith('Exif')) {
          parseTiffHeader(bytes, offset + 10, length - 6);
        } else {
          // Check for XMP metadata containing generation parameters
          const textChunk = new TextDecoder('utf-8', { fatal: false }).decode(
            bytes.slice(offset + 4, Math.min(offset + length + 2, bytes.length))
          );
          detectSyntheticSignatures(textChunk);
        }
      }

      offset += 2 + length;
    }
  } else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    // PNG format chunks (tEXt, iTXt, zTXt)
    const textChunk = new TextDecoder('utf-8', { fatal: false }).decode(bytes.slice(0, Math.min(bytes.length, 12000)));
    detectSyntheticSignatures(textChunk);
  }

  function detectSyntheticSignatures(rawText: string) {
    const lower = rawText.toLowerCase();
    const generators = [
      { name: 'Midjourney', pattern: /midjourney/i },
      { name: 'Stable Diffusion', pattern: /stable diffusion|sdxl|stablediffusion/i },
      { name: 'DALL-E', pattern: /dall-e|dalle/i },
      { name: 'ComfyUI', pattern: /comfyui/i },
      { name: 'Automatic1111', pattern: /automatic1111/i },
      { name: 'Flux', pattern: /flux\.1|bfl flux/i },
      { name: 'NovelAI', pattern: /novelai/i }
    ];

    for (const gen of generators) {
      if (gen.pattern.test(lower)) {
        softwareDetected = gen.name;
        technicalIndicators.push(`Synthetic generator signature detected: ${gen.name}`);
        break;
      }
    }

    if (/parameters\s*:/i.test(rawText) || /steps:\s*\d+/i.test(rawText) || /sampler:\s*[a-z0-9_]+/i.test(rawText)) {
      technicalIndicators.push('Diffusion sampling parameters embedded in file metadata');
      if (!softwareDetected) softwareDetected = 'Diffusion Model Workflow';
    }
  }

  function parseTiffHeader(data: Uint8Array, tiffStart: number, maxLen: number) {
    if (tiffStart + 8 > data.length) return;
    const isLittleEndian = data[tiffStart] === 0x49 && data[tiffStart + 1] === 0x49;
    const get16 = (pos: number) => {
      const idx = tiffStart + pos;
      if (idx + 1 >= data.length) return 0;
      return isLittleEndian ? data[idx] | (data[idx + 1] << 8) : (data[idx] << 8) | data[idx + 1];
    };
    const get32 = (pos: number) => {
      const idx = tiffStart + pos;
      if (idx + 3 >= data.length) return 0;
      return isLittleEndian
        ? data[idx] | (data[idx + 1] << 8) | (data[idx + 2] << 16) | (data[idx + 3] << 24)
        : (data[idx] << 24) | (data[idx + 1] << 16) | (data[idx + 2] << 8) | data[idx + 3];
    };

    const firstIFD = get32(4);
    if (firstIFD < 8 || firstIFD > maxLen) return;

    const numEntries = get16(firstIFD);
    for (let i = 0; i < Math.min(numEntries, 40); i++) {
      const entryPos = firstIFD + 2 + i * 12;
      const tag = get16(entryPos);
      const count = get32(entryPos + 4);
      const valOffset = count <= 4 ? entryPos + 8 : get32(entryPos + 8);

      const readString = (pos: number, len: number) => {
        const start = tiffStart + pos;
        const end = Math.min(start + len, data.length);
        let str = '';
        for (let j = start; j < end; j++) {
          if (data[j] === 0) break;
          str += String.fromCharCode(data[j]);
        }
        return str.trim();
      };

      if (tag === 0x010F) { // Make
        cameraMake = readString(valOffset, count);
      } else if (tag === 0x0110) { // Model
        cameraModel = readString(valOffset, count);
      } else if (tag === 0x0131) { // Software
        softwareDetected = readString(valOffset, count);
      } else if (tag === 0x0132) { // DateTime
        dateTime = readString(valOffset, count);
      }
    }
  }

  if (cameraMake || cameraModel) {
    hasExifCameraData = true;
    technicalIndicators.push(`Optical capture hardware tag found: ${[cameraMake, cameraModel].filter(Boolean).join(' ')}`);
    if (dateTime) {
      technicalIndicators.push(`Hardware timestamp recorded: ${dateTime}`);
    }
  }

  // Label derivation
  let label: ImageAuthenticityLabel = 'Unclear';
  let reasoning = '';

  if (softwareDetected && (softwareDetected.includes('Midjourney') || softwareDetected.includes('Diffusion') || softwareDetected.includes('Flux') || softwareDetected.includes('DALL-E') || softwareDetected.includes('ComfyUI'))) {
    label = 'Likely AI-generated';
    reasoning = `Metadata inspection identified generator parameters and signatures associated with ${softwareDetected}.`;
  } else if (hasExifCameraData) {
    label = 'Looks real';
    reasoning = `Valid EXIF optical hardware metadata is present (${[cameraMake, cameraModel].filter(Boolean).join(' ')}), consistent with authentic photographic camera capture.`;
  } else {
    // If no hardware camera data is present, evaluate whether common online stripped image or synthetic
    label = 'Unclear';
    technicalIndicators.push('Standard EXIF camera metadata headers absent or scrubbed by compression');
    reasoning = 'No definitive camera sensor metadata was found. Most online platforms scrub EXIF tags during upload; visual and context research should be referenced.';
  }

  return {
    label,
    hasExifCameraData,
    cameraMake,
    cameraModel,
    softwareDetected,
    dateTime,
    reasoning,
    technicalIndicators
  };
}
