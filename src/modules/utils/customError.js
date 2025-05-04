export class CustomError extends Error {
  constructor(message, issues = []) {
    super(message);
    this.message = message;
    this.name = "CustomError";
    this.issues = issues;
    this.success = false;
    Error.captureStackTrace(this, CustomError);
  }
}
