export let ONE_MILISECOND: bigint = BigInt(10 ** 6);
export let ONE_SECOND = 10 ** 9;
export let ONE_SECOND_N: bigint = BigInt(ONE_SECOND);

export let nowTime = (): bigint => process.hrtime.bigint();
export let timeToSeconds = (t: bigint): number => Number(t * 1000n / ONE_MILISECOND) / 1000;
export let timeToMilliseconds = (t: bigint) => t / ONE_MILISECOND;
