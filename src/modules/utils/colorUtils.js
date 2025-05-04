export class Color {
  constructor() {
    this.colorMap = {
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
    };

    for (const [colorName, code] of Object.entries(this.colorMap)) {
      this[colorName] = (text) => `${code}${text}\x1b[0m`;
    }
  }
}
