import { create } from 'zustand';
import type { Point2D, GestureState, HandData } from '@/types/hand-tracking';

export type AppMode = 'idle' | 'drawing' | 'submitting' | 'thinking' | 'response' | 'model' | 'annotate';
export type InteractionMode = 'draw' | 'model' | 'annotate';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: string | null;
}

interface DrawingState {
  strokes: Point2D[][];
  currentStroke: Point2D[];
}

interface AnnotationState {
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

  // Multi-hand tracking
  hands: HandData[];
  setHands: (hands: HandData[]) => void;

  // Interaction mode
  interactionMode: InteractionMode;
  setInteractionMode: (mode: InteractionMode) => void;

  // Drawing
  drawing: DrawingState;
  addPointToCurrentStroke: (point: Point2D) => void;
  finishCurrentStroke: () => void;
  clearDrawing: () => void;

  // Annotations (2D overlay on 3D model)
  annotations: AnnotationState;
  addAnnotationPoint: (point: Point2D) => void;
  finishAnnotationStroke: () => void;
  clearAnnotations: () => void;

  // Gesture tracking for mode switching
  lastPeaceGestureTime: number | null;
  setLastPeaceGestureTime: (time: number | null) => void;

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

  // Chat
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  toggleChat: () => void;
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;

  // Info modal
  infoOpen: boolean;
  setInfoOpen: (open: boolean) => void;
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

  // Multi-hand tracking
  hands: [],
  setHands: (hands) =>
    set({
      hands,
      fingertipPosition: hands[0]?.fingertipPosition ?? null,
      currentGesture: hands[0]?.gesture ?? { type: 'idle', confidence: 0 },
    }),

  // Interaction mode
  interactionMode: 'draw',
  setInteractionMode: (interactionMode) => set({ interactionMode }),

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

  // Annotations
  annotations: { strokes: [], currentStroke: [] },
  addAnnotationPoint: (point) =>
    set((state) => ({
      annotations: {
        ...state.annotations,
        currentStroke: [...state.annotations.currentStroke, point],
      },
    })),
  finishAnnotationStroke: () =>
    set((state) => ({
      annotations: {
        strokes:
          state.annotations.currentStroke.length > 0
            ? [...state.annotations.strokes, state.annotations.currentStroke]
            : state.annotations.strokes,
        currentStroke: [],
      },
    })),
  clearAnnotations: () => set({ annotations: { strokes: [], currentStroke: [] } }),

  // Gesture tracking
  lastPeaceGestureTime: null,
  setLastPeaceGestureTime: (lastPeaceGestureTime) => set({ lastPeaceGestureTime }),

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

  // Chat
  chatOpen: false,
  setChatOpen: (chatOpen) => set({ chatOpen }),
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),

  // Info modal
  infoOpen: false,
  setInfoOpen: (infoOpen) => set({ infoOpen }),
}));
