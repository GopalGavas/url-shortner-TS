class ApiError extends Error {
  public success: boolean;
  public data: any;

  constructor(
    public statusCode: number,
    public message: string = "Something went wrong",
    public errors: string[] = [],
    public stack?: string
  ) {
    super(message);
    this.success = false;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
