export interface CommandError {
  message: string;
}

export function error(message: string): never {
  return (() => {
    throw new Error(message);
  })();
}
