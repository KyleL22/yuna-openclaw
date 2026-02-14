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
  return value
    .replace(/\*\*/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\([^\)]*\)/g, "$1")
    .trim();
};

const normalizeToken = (value: string): string => {
  return stripMarkdown(value)
    .replace(/[^\w\s\/]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
};

const parseStatus = (value: string): ProjectStatus => {
  const normalized = normalizeToken(value);
  if (normalized.includes("DONE")) return "DONE";
  if (normalized.includes("INPROGRESS")) return "INPROGRESS";
  if (normalized.includes("CANCELLED")) return "CANCELLED";
  if (normalized.includes("HOLD")) return "HOLD";
  return normalized;
};

const parseApproval = (value: string): ApprovalStatus => {
  const normalized = normalizeToken(value);
  if (normalized.includes("APPROVED")) return "APPROVED";
  if (normalized.includes("WAITING")) return "WAITING";
  return normalized;
};

const extractCommitUrl = (value: string): string => {
  const matched = value.match(/https?:\/\/[^\s\)]+/);
  return matched?.[0] ?? "";
};

const toCellArray = (line: string): string[] => {
  return line
    .trim()
    .split("|")
    .slice(1)
    .map((item) => item.trim());
};

const resolveGatePath = async (): Promise<string> => {
  const root = process.cwd();
  const candidates = [
    path.resolve(root, "docs/pm/GATE.md"),
    path.resolve(root, "../docs/pm/GATE.md"),
    path.resolve(root, "gajae-company/docs/pm/GATE.md"),
  ];

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  return candidates[0];
};

export const loadProjectGateRows = async (): Promise<ProjectGateRow[]> => {
  const gatePath = await resolveGatePath();
  const md = await fs.readFile(gatePath, "utf8");

  const lines = md.split("\n").map((line) => line.trimEnd());

  const startIndex = lines.findIndex((line) =>
    line.includes("피쳐명") && line.includes("단계") && line.includes("담당 가재")
  );

  if (startIndex === -1) return [];

  return lines
    .slice(startIndex + 2)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && !line.startsWith("| :"))
    .map((line) => toCellArray(line))
    .map((cells) => {
      const approval = parseApproval(cells[4] ?? "");
      return {
        feature: stripMarkdown(cells[0] ?? ""),
        step: stripMarkdown(cells[1] ?? ""),
        owner: stripMarkdown(cells[2] ?? ""),
        status: parseStatus(cells[3] ?? ""),
        approval,
        lastUpdated: stripMarkdown(cells[5] ?? ""),
        commitUrl: extractCommitUrl(cells[6] ?? ""),
        waiting: approval.includes("WAITING"),
      } as ProjectGateRow;
    })
    .filter((row) => row.feature && row.step);
};
