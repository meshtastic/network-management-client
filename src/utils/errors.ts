export interface CommandError {
  message: string;
}

export function isCommandError(error: unknown): error is CommandError {
  return (error as CommandError).message !== undefined;
}

export function throwError(message: string): never {
  return (() => {
    throw new Error(message);
  })();
}
