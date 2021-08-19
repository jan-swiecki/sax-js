import _ = require("lodash");

let stream = process.stderr;
let ONE_MILISECOND: bigint = BigInt(10**6)
let ONE_SECOND = 10**9
let ONE_SECOND_N: bigint = BigInt(ONE_SECOND)

let nowTime = (): bigint => process.hrtime.bigint()
let timeToSeconds = (t: bigint): number => Number(t*1000n/ONE_MILISECOND)/1000
let timeToMilliseconds = (t: bigint) => t/ONE_MILISECOND

const AVERAGE_OVER_TICKS = 1000

type Options = {
  ticksBufferSize: number,
  type: 'bytes'
}

type Tick = {
  x: bigint,
  t: bigint
}

function incrMax(x: number, max: number) {
  const next = x+1
  if(next === max) {
    return 0
  } else {
    return next
  }
}

class SpeedCounter {
  private t_ticks: BigInt64Array = new BigInt64Array(10000)
  private sum_ticks: BigInt64Array = new BigInt64Array(10000)
  private max: number

  private idx0 = 0
  private idx1 = 0

  name: string;
  avg = 0
  total = 0n
  count = 0n

  private rolledOver = false

  constructor(name: string, options: Options) {
    this.name = name

    this.max = options.ticksBufferSize
    this.t_ticks = new BigInt64Array(this.max)
    this.sum_ticks = new BigInt64Array(this.max)
  }

  init() {
    this.t_ticks.fill(0n)
    this.sum_ticks.fill(0n)
    this.idx0 = 0
    this.idx1 = 0
    this.count = 0n
  }

  private getTimeSpan(): bigint {
    return this.t_ticks[this.idx1] - this.t_ticks[this.idx0]
  }

  private getSizeSpan(): bigint {
    return this.sum_ticks[this.idx1] - this.sum_ticks[this.idx0]
  }

  tick(x: number) {
    const t = nowTime()
    const xn = BigInt(x)
    this.count++

    const lastIdx1 = this.idx1;
    if(! this.rolledOver) {
      this.idx1 = incrMax(this.idx1, this.max)
      if(this.idx1 === 0) {
        this.idx0 = incrMax(this.idx0, this.max)
        this.rolledOver = true
      }
    } else {
      this.idx0 = incrMax(this.idx0, this.max)
      this.idx1 = incrMax(this.idx1, this.max)
    }

    this.t_ticks[this.idx1] = t
    this.sum_ticks[this.idx1] = this.sum_ticks[lastIdx1] + xn
    this.total += xn

    if(this.rolledOver) {
      const x = this.getSizeSpan()
      const t = this.getTimeSpan()

      this.avg = Number(ONE_SECOND_N * 1000000n * x/t)/1000000
    } else {
      this.avg = 0
    }
  }
}

class SpeedMeter {
  private counters: SpeedCounter[] = []
  private printThreshold = 1000000n;
  private lastTime = nowTime()

  private interval: NodeJS.Timer

  addCounter(counter: SpeedCounter) {
    this.counters.push(counter)
  }

  private print() {
    const now = nowTime()

    if(now - this.lastTime > this.printThreshold) {
      this.lastTime = nowTime()

      let str = []
      for(const counter of this.counters) {
        str = str.concat([
          counter.name,
          counter.avg,
          `[ total = `,
          counter.total,
          ', count = ',
          counter.count,
          ` ]`
        ])
      }

      this.writeLine(str.join(' '))
    }
  }

  start() {
    this.interval = setInterval(() => {
      this.print()
    }, 50)
  }

  stop() {
    if(! _.isUndefined(this.interval)) {
      clearInterval(this.interval)
    }
  }

  writeLine(line: string, force: boolean = false) {
    // Console
    if(stream.cursorTo) {
      stream.cursorTo(0);
      stream.write(line);
      stream.clearLine(1);
    }
    // No console
    else {
      stream.write(`${new Date().toISOString()}  ${line}\n`);
    }
  };
}

export function getSpeedCounter(name: string, options: Options): SpeedCounter {
  return new SpeedCounter(name, options)
}

export function getSpeedMeter(): SpeedMeter {
  return new SpeedMeter()
}