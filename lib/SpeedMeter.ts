import _ = require("lodash");
import { nowTime } from "./nanoTime";
import { getSpeedCounter } from "./speed";
import { SpeedCounter } from "./SpeedCounter";
import { SpeedFormatter, plainFormatter } from './SpeedFormatters';

let stream = process.stderr;

export class SpeedMeter {
  private counters: SpeedCounter[] = []
  private formatters: SpeedFormatter[] = [];
  private printThreshold = 10000000n;
  private lastTime = nowTime()

  private interval: NodeJS.Timer

  addCounter(counterName: string, formatter?: SpeedFormatter): SpeedCounter {
    const counter = getSpeedCounter(counterName)
    this.counters.push(counter)
    this.formatters.push(formatter ? formatter : plainFormatter)
    return counter
  }

  start(): SpeedMeter {
    this.interval = setInterval(() => {
      this.print()
    }, 50)
    return this
  }

  stop(): SpeedMeter {
    if(! _.isUndefined(this.interval)) {
      clearInterval(this.interval)
      stream.write('\n')
    }
    return this
  }

  private print() {
    const now = nowTime()

    if(now - this.lastTime > this.printThreshold) {
      this.lastTime = nowTime()

      let str = []
      let fmtIdx = 0
      for(const counter of this.counters) {
        const fmt = this.formatters[fmtIdx++]
        
        const {speed, total} = fmt(counter.avg, counter.total)

        str = str.concat([
          counter.name.padEnd(16),
          ' :: ',
          speed,
          `[ total = `,
          total,
          // ', count = ',
          // counter.count,
          ` ]`
        ].join(' '))
      }

      this.writeLine(`${str.join('\n')}`)
    }
  }

  private writeLine(line: string, force: boolean = false) {
    // Console
    if(stream.cursorTo) {
      // stream.cursorTo(0);
      // stream.write(line);
      // stream.clearLine(1);
      stream.cursorTo(0, 0);
      stream.clearScreenDown()
      stream.write(line);
      // stream.clearLine(1);
    }
    // No console
    else {
      stream.write(`${new Date().toISOString()}  ${line}\n`);
    }
  };
}