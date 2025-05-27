export type Tracks = Record<string, number[]>;
export type TrackColors = Record<string, [number, number, number, number]>;
export type PlotXYSettings = {
  colors?: TrackColors;
  sort?: string[];
};
