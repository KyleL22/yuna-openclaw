import fs from "fs/promises";
import path from "path";

export type ProjectStatus = "DONE" | "INPROGRESS" | "CANCELLED" | "HOLD" | string;
export type ApprovalStatus = "APPROVED" | "WAITING" | string;

export type ProjectGateRow = {
  feature: string;
  step: string;
  owner: string;
  status: ProjectStatus;
  approval: ApprovalStatus;
  lastUpdated: string;
  commitUrl: string;
  waiting: boolean;
};

const stripMarkdown = (value: string): string => {
  const withoutEmphasis = value.replace(/\*\*/g, "");
  return withoutEmphasis
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\([^\)]*\)/g, "$1")
    .trim();
};

const extractCommitUrl = (value: string): string => {
  const match = value.match(/\((https?:\/\/[^)]+)\)/);
  if (match?.[1]) return match[1];

  return "";
};

const toCellArray = (line: string): string[] => {
  return line
    .trim()
    .split("|")
    .slice(1)
    .map((item) => stripMarkdown(item));
};

export const loadProjectGateRows = async (): Promise<ProjectGateRow[]> => {
  const root = process.cwd();
  const gatePath = path.resolve(root, "docs/pm/GATE.md");
  const md = await fs.readFile(gatePath, "utf8");

  const lines = md.split("\n").map((line) => line.trimEnd());

  const startIndex = lines.findIndex((line) =>
    line.includes("피쳐명") && line.includes("단계") && line.includes("담당 가재")
  );

  if (startIndex === -1) return [];

  // Skip header + divider, parse until blank/non-table line.
  return lines
    .slice(startIndex + 2)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && !line.startsWith("| :"))
    .map((line) => {
      const cells = toCellArray(line);
      return {
        feature: cells[0] ?? "",
        step: cells[1] ?? "",
        owner: cells[2] ?? "",
        status: cells[3] ?? "",
        approval: cells[4] ?? "",
        lastUpdated: cells[5] ?? "",
        commitUrl: extractCommitUrl(cells[6] ?? ""),
        waiting: (cells[4] ?? "").includes("WAITING"),
      } as ProjectGateRow;
    })
    .filter((row) => row.feature && row.step);
};
