export function assert(value: boolean, message: string): asserts value {
  if (!value) {
    throw new Error(message);
  }
}

export function warnIf(value: boolean, message: string) {
  if (value) {
    console.warn(message);
  }
}
