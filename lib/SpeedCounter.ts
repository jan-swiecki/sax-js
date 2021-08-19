import { nowTime, ONE_SECOND_N } from "./nanoTime";


export type Options = {
  ticksBufferSize: number,
  type: 'bytes'
}


export function incrMax(x: number, max: number) {
  const next = x+1
  if(next === max) {
    return 0
  } else {
    return next
  }
}


export class SpeedCounter {
  private t_ticks: BigInt64Array = new BigInt64Array(10000);
  private sum_ticks: BigInt64Array = new BigInt64Array(10000);
  private max: number;

  private idx0 = 0;
  private idx1 = 0;

  rolledOver = false;
  name: string;
  avg: number;
  total: number;
  count: bigint;

  constructor(name: string, options: Options) {
    this.name = name;
    this.max = options.ticksBufferSize;
    this.reset()
  }

  reset() {
    this.t_ticks = new BigInt64Array(this.max);
    this.sum_ticks = new BigInt64Array(this.max);
    this.t_ticks.fill(0n);
    this.sum_ticks.fill(0n);
    this.idx0 = 0;
    this.idx1 = 0;
    this.count = 0n;
    this.total = 0;
    this.avg = 0;
  }

  tick(x: number) {
    const t = nowTime();
    const xn = BigInt(x);
    this.count++;

    const lastIdx1 = this.idx1;
    if (!this.rolledOver) {
      this.idx1 = incrMax(this.idx1, this.max);
      if (this.idx1 === 0) {
        this.idx0 = incrMax(this.idx0, this.max);
        this.rolledOver = true;
      }
    } else {
      this.idx0 = incrMax(this.idx0, this.max);
      this.idx1 = incrMax(this.idx1, this.max);
    }

    this.t_ticks[this.idx1] = t;
    this.sum_ticks[this.idx1] = this.sum_ticks[lastIdx1] + xn;
    this.total += x;

    if (this.rolledOver) {
      const x = this.getSizeSpan();
      const t = this.getTimeSpan();

      this.avg = Number(ONE_SECOND_N * 1000000n * x / t) / 1000000;
    } else {
      this.avg = 0;
    }
  }

  private getTimeSpan(): bigint {
    return this.t_ticks[this.idx1] - this.t_ticks[this.idx0];
  }

  private getSizeSpan(): bigint {
    return this.sum_ticks[this.idx1] - this.sum_ticks[this.idx0];
  }
}
