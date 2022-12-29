export const writeValueToClipboard = async (value: string) => {
  await navigator.clipboard.writeText(value);
};
