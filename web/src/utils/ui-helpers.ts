// https://github.com/reown-com/appkit/blob/main/packages/ui/src/utils

export type TruncateType = "start" | "middle" | "end";

export type TruncateOptions = {
  string: string;
  charsStart: number;
  charsEnd: number;
  truncate: TruncateType;
};

export function getTruncateString({
  string,
  charsStart,
  charsEnd,
  truncate,
}: TruncateOptions) {
  if (string.length <= charsStart + charsEnd) {
    return string;
  }

  if (truncate === "end") {
    return `${string.substring(0, charsStart)}...`;
  } else if (truncate === "start") {
    return `...${string.substring(string.length - charsEnd)}`;
  }

  return `${string.substring(0, Math.floor(charsStart))}...${string.substring(
    string.length - Math.floor(charsEnd)
  )}`;
}
