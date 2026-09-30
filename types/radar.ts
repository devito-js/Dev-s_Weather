export interface RadarFrame {
  timestamp: number;
  tileUrl: string;
}
export interface Radar {
  frames: RadarFrame[];
  coverageUrl?: string;
  attribution: string;
}
