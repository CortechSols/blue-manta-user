import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanBotMarkdown(raw: string): string {
  const lines = raw.split("\n");
  const cleanedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Keep numbered lines as-is
    if (/^\d+\.\s\*\*/.test(line)) {
      cleanedLines.push(line, ""); // Add blank line after project title
      continue;
    }

    // Fix lines like "- **Description**: ..."
    if (/^- \*\*(Description|Contributors)\*\*:/.test(line)) {
      cleanedLines.push(line.replace(/^- /, "")); // remove dash, keep bold label
      continue;
    }

    // Contributor names (lines that start with - and are NOT labels)
    if (/^- /.test(line)) {
      cleanedLines.push("  " + line); // indent for nested bullet
      continue;
    }

    cleanedLines.push(line);
  }

  return cleanedLines.join("\n");
}
