import { create } from 'zustand';
import type { Point2D, GestureState } from '@/types/hand-tracking';

export type AppMode = 'idle' | 'drawing' | 'submitting' | 'thinking' | 'response';

interface DrawingState {
  strokes: Point2D[][];
  currentStroke: Point2D[];
}

interface AppState {
  // Mode
  mode: AppMode;
  setMode: (mode: AppMode) => void;

  // Webcam
  webcamEnabled: boolean;
  setWebcamEnabled: (enabled: boolean) => void;

  // Hand tracking
  isTracking: boolean;
  setIsTracking: (tracking: boolean) => void;
  currentGesture: GestureState;
  setCurrentGesture: (gesture: GestureState) => void;
  fingertipPosition: Point2D | null;
  setFingertipPosition: (position: Point2D | null) => void;

  // Drawing
  drawing: DrawingState;
  addPointToCurrentStroke: (point: Point2D) => void;
  finishCurrentStroke: () => void;
  clearDrawing: () => void;

  // Text input
  inputText: string;
  setInputText: (text: string) => void;

  // AI Response
  response: string;
  setResponse: (response: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // FPS
  fps: number;
  setFps: (fps: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Mode
  mode: 'idle',
  setMode: (mode) => set({ mode }),

  // Webcam
  webcamEnabled: false,
  setWebcamEnabled: (webcamEnabled) => set({ webcamEnabled }),

  // Hand tracking
  isTracking: false,
  setIsTracking: (isTracking) => set({ isTracking }),
  currentGesture: { type: 'idle', confidence: 0 },
  setCurrentGesture: (currentGesture) => set({ currentGesture }),
  fingertipPosition: null,
  setFingertipPosition: (fingertipPosition) => set({ fingertipPosition }),

  // Drawing
  drawing: { strokes: [], currentStroke: [] },
  addPointToCurrentStroke: (point) =>
    set((state) => ({
      drawing: {
        ...state.drawing,
        currentStroke: [...state.drawing.currentStroke, point],
      },
    })),
  finishCurrentStroke: () =>
    set((state) => ({
      drawing: {
        strokes:
          state.drawing.currentStroke.length > 0
            ? [...state.drawing.strokes, state.drawing.currentStroke]
            : state.drawing.strokes,
        currentStroke: [],
      },
    })),
  clearDrawing: () => set({ drawing: { strokes: [], currentStroke: [] } }),

  // Text input
  inputText: '',
  setInputText: (inputText) => set({ inputText }),

  // AI Response
  response: '',
  setResponse: (response) => set({ response }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  // FPS
  fps: 0,
  setFps: (fps) => set({ fps }),
}));
