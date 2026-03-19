declare module '@mediapipe/tasks-vision' {
  export interface NormalizedLandmark {
    x: number;
    y: number;
    z: number;
    visibility?: number;
  }

  export interface Category {
    index: number;
    score: number;
    categoryName: string;
    displayName: string;
  }

  export interface HandLandmarkerResult {
    landmarks: NormalizedLandmark[][];
    worldLandmarks: NormalizedLandmark[][];
    handedness: Category[][];
  }

  export interface HandLandmarkerOptions {
    baseOptions: {
      modelAssetPath: string;
      delegate?: 'GPU' | 'CPU';
    };
    runningMode: 'IMAGE' | 'VIDEO';
    numHands?: number;
    minHandDetectionConfidence?: number;
    minHandPresenceConfidence?: number;
    minTrackingConfidence?: number;
  }

  export class HandLandmarker {
    static createFromOptions(
      vision: VisionTasksWasm,
      options: HandLandmarkerOptions
    ): Promise<HandLandmarker>;
    detectForVideo(
      video: HTMLVideoElement,
      timestamp: number
    ): HandLandmarkerResult;
    detect(image: HTMLImageElement | HTMLCanvasElement): HandLandmarkerResult;
    close(): void;
  }

  export interface VisionTasksWasm {
    wasmLoaderPath: string;
    wasmBinaryPath: string;
  }

  export class FilesetResolver {
    static forVisionTasks(wasmPath: string): Promise<VisionTasksWasm>;
  }
}
