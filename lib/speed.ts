import _ = require("lodash");
import { Options, SpeedCounter } from "./SpeedCounter";
import { SpeedMeter } from './SpeedMeter';

export function getSpeedCounter(name: string, options?: Options): SpeedCounter {
  options = options || {
    type: 'bytes',
    ticksBufferSize: 10000
  }
  return new SpeedCounter(name, options)
}

export function getSpeedMeter(): SpeedMeter {
  return new SpeedMeter()
}