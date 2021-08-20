var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
__export(exports, {
  bytesEmojiFormatter: () => bytesEmojiFormatter,
  formatBytes: () => formatBytes,
  plainFormatter: () => plainFormatter
});
function plainFormatter(bps, total) {
  return {
    speed: bps + "",
    total: total + ""
  };
}
__name(plainFormatter, "plainFormatter");
function formatBytes(bytes) {
  let f;
  let unit;
  if (bytes < 10) {
    f = 0;
    unit = "b";
  } else if (bytes < 1024) {
    f = 0;
    unit = "b";
  } else if (bytes < 1024 ** 2) {
    f = 1;
    unit = "kb";
  } else if (bytes < 1024 ** 3) {
    f = 2;
    unit = "mb";
  } else if (bytes < 1024 ** 4) {
    f = 3;
    unit = "gb";
  } else {
    f = 5;
    unit = "gb";
  }
  return (bytes / 1024 ** f).toFixed(2) + unit;
}
__name(formatBytes, "formatBytes");
function bytesEmojiFormatter(bps, total) {
  let speed_f;
  let speed_unit;
  let total_f;
  let total_unit;
  let emoji;
  if (total === 0) {
    emoji = "\u{1F4E1}";
    speed_f = 0;
    speed_unit = "b";
  } else if (bps < 10) {
    speed_f = 0;
    speed_unit = "b";
    emoji = "\u{1F480}";
  } else if (bps < 1024) {
    speed_f = 0;
    speed_unit = "b";
    emoji = "\u{1F61F}";
  } else if (bps < 1024 ** 2) {
    speed_f = 1;
    speed_unit = "kb";
    if (total < 1024 ** 2) {
      emoji = "\u{1F525}";
    } else {
      emoji = "\u{1F914}";
    }
  } else if (bps < 1024 ** 3) {
    speed_f = 2;
    speed_unit = "mb";
    emoji = "\u{1F525}";
  } else if (bps < 1024 ** 4) {
    speed_f = 3;
    speed_unit = "gb";
    emoji = "\u{1F680}";
  } else {
    speed_f = 5;
    speed_unit = "gb";
    emoji = "\u{1F47E}";
  }
  if (total < 1024) {
    total_f = 0;
    total_unit = "b";
  } else if (total < 1024 ** 2) {
    total_f = 1;
    total_unit = "kb";
  } else if (total < 1024 ** 3) {
    total_f = 2;
    total_unit = "mb";
  } else {
    total_f = 3;
    total_unit = "gb";
  }
  const speed = bps === 0 ? "0.00" : (bps / 1024 ** speed_f).toFixed(2);
  return {
    total: ((total / 1024 ** total_f).toFixed(2) + total_unit).padStart(6),
    speed: `${emoji}  ${speed}${speed_unit}ps`.padStart(16)
  };
}
__name(bytesEmojiFormatter, "bytesEmojiFormatter");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  bytesEmojiFormatter,
  formatBytes,
  plainFormatter
});
