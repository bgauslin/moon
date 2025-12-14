export enum Events {
  AnimationEnd = 'animationend',
  KeyDown = 'keydown',
  Location = 'location',
  Progress = 'progress',
  TouchEnd = 'touchend',
  TouchStart = 'touchstart',
}

export interface Arc {
  radius: number,
  sweep: number,
}

export const Chart = {
  gap: 8,
  margin: 44,
  size: 320,
  sweep: 72,
}

export interface LabelProps {
  angle: number,
  radius: number,
  xOffset: number,
  yOffset: number,
}

export interface MoonData {
  hemisphere: string,
  illumination: number,
  moonrise: string,
  moonset: string,
  percent: number,
  phase: string,
  sunrise: string,
  sunset: string,
}

export interface MoonriseMoonset {
  moonrise: string,
  moonset: string,
}

export interface Point {
  x: number,
  y: number,
}

export interface SunriseSunset {
  sunrise: string,
  sunset: string,
}

export interface Tick {
  start: number,
  end: number,
}
