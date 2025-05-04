import { Color } from "./colorUtils.js";

export class Logger {
  constructor() {
    this.color = new Color();

    this.loggerMap = {
      log: "blue",
      error: "red",
      warn: "yellow",
      success: "green",
    };

    for (let [methodName, colorName] of Object.entries(this.loggerMap)) {
      this[methodName] = function (message) {
        if (methodName === "error") {
          console.log(this.color[colorName]("[ERROR]"), message.message);
          let issueList = message.issues;
          if (typeof issueList === "object" && issueList) {
            issueList.forEach((issue) => {
              console.log("->", issue);
            });
          }
          if (message.stack) {
            console.log(message.stack);
          }
        } else {
          console.log(
            this.color[colorName](`[${methodName.toUpperCase()}]`),
            message
          );
        }
      };
    }
  }
}
