export type SpeedFormatter = (bps: number, total: number) => {speed: string, total: string}


export function plainFormatter(bps: number, total: number) {
  return {
    speed: bps+'',
    total: total+''
  }
}


export function bytesEmojiFormatter(bps: number, total: number) {
  let speed_f: number
  let speed_unit: string
  let total_f: number
  let total_unit: string
  let emoji: string

  if(total === 0) {
    emoji = '📡'
    speed_f = 0;
    speed_unit = 'b'
  } else if(bps < 10) {
    speed_f = 0;
    speed_unit = 'b';
    emoji = '💀';
  } else if(bps < 1024) {
    speed_f = 0;
    speed_unit = 'b';
    emoji = '😟';
  } else if(bps < 1024**2) {
    speed_f = 1;
    speed_unit = 'kb';

    if(total < 1024**2) {
      emoji = '🔥';
    } else {
      emoji = '🤔';
    }
  } else if(bps < 1024**3) {
    speed_f = 2;
    speed_unit = 'mb';
    emoji = '🔥';
  } else if(bps < 1024**4) {
    speed_f = 3;
    speed_unit = 'gb';
    emoji = '🚀';
  } else {
    speed_f = 5;
    speed_unit = 'gb';
    emoji = '👾';
  }

  if(total < 1024) {
    total_f = 0;
    total_unit = 'b';
  } else if(total < 1024**2) {
    total_f = 1;
    total_unit = 'kb';
  } else if(total < 1024**3) {
    total_f = 2;
    total_unit = 'mb';
  } else {
    total_f = 3;
    total_unit = 'gb';
  }

  // const speed = bps === 0 ? '0.00' : Math.round((bps/(1024**speed_f))*100)/100;
  const speed = bps === 0 ? '0.00' : (bps/(1024**speed_f)).toFixed(2)
  return {
    // total: (Math.round((total/(1024**total_f))*100)/100 + total_unit).padStart(10),
    total: ((total/(1024**total_f)).toFixed(2) + total_unit).padStart(6),
    speed: (`${emoji}  ${speed}${speed_unit}ps`).padStart(16)
  }
}