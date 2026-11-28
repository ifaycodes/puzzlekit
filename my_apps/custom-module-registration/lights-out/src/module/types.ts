export interface LightsOutConfig {
  size: number;
  initialLights?: boolean[];
}

export interface LightsOutState {
  size: number;
  lights: boolean[];
  moves: number;
}

export interface ToggleLightPayload {
  index: number;
}