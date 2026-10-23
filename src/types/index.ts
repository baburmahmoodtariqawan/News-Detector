/**
 * Veritas Type Definitions
 * Clean domain types for multi-modal context and verification research.
 */

export type InputMode = 'text' | 'image' | 'url' | 'voice';

export type AssessmentStatus = 'corroborated' | 'unclear' | 'contradicted';

export type ImageAuthenticityLabel = 'Looks real' | 'Likely AI-generated' | 'Unclear';

export interface SourceCitation {
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  corroborationStatus?: 'supports' | 'context' | 'refutes';
}

export interface ImageMetadataInfo {
  label: ImageAuthenticityLabel;
  hasExifCameraData: boolean;
  cameraMake?: string;
  cameraModel?: string;
  lensModel?: string;
  dateTime?: string;
  softwareDetected?: string;
  extractedText?: string;
  reasoning: string;
  technicalIndicators: string[];
}

export interface ResearchResult {
  id: string;
  inputType: InputMode;
  querySummary: string;
  headline: string;
  status: AssessmentStatus;
  explanation: string;
  sources: SourceCitation[];
  transcript?: string;
  imageAssessment?: ImageMetadataInfo;
  urlMetadata?: {
    resolvedUrl: string;
    domain: string;
    title: string;
    extractedExcerpt?: string;
  };
  timestamp: number;
}

export interface AnalysisRequest {
  type: InputMode;
  content: string; // Text query, URL, base64 data, or transcript
  metadata?: {
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
    rawAudioLangHint?: string;
  };
}

export interface AnalysisResponse {
  success: boolean;
  data?: ResearchResult;
  error?: string;
  retryCount?: number;
}
