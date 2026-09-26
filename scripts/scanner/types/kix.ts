export type BarState = 'T' | 'A' | 'D' | 'F';

export interface DetectedBar {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  state: BarState;
  confidence: number;
  charIndex: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DecodedCharacter {
  char: string;
  daft: string;
  barIndices: number[];
}

export interface KixDecodeResult {
  success: boolean;
  rawText: string;
  daftSequence: string;
  bars: DetectedBar[];
  characters: DecodedCharacter[];
  boundingBox?: BoundingBox;
  confidence: number;
  rotation: number;
  latencyMs: number;
  engine: 'client-cv';
  error?: string;
  debugInfo?: {
    totalBarsFound: number;
    validBarTuples: number;
    thresholdMethod?: string;
    deskewAngle?: number;
  };
}

export interface KixPreset {
  id: string;
  title: string;
  code: string;
  location: string;
  description: string;
}

export interface ScanHistoryItem {
  id: string;
  timestamp: number;
  result: KixDecodeResult;
  thumbnailUrl: string;
  sourceType: 'data-url' | 'upload' | 'camera' | 'paste' | 'preset' | 'generated';
}
