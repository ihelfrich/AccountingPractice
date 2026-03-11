import bankData from "./midterm2TestBank.json";

export type RescueTopic = {
  topic: string;
  mascot: string;
  tagline: string;
  teach: string;
  formula: string;
  worked: string;
  finishOne: string;
  finishAnswer: string;
  trap: string;
  memory: string;
};

export type QuestionFamily = "diagnostic" | "drill" | "mixed";
export type QuestionType = "mcq" | "numeric" | "classification";

export type BankQuestion = {
  id: number;
  topic: string;
  family: QuestionFamily;
  type: QuestionType;
  prompt: string;
  options?: string[];
  answer: number | string;
  explanation: string;
  hint?: string;
};

export type StatementDirection = "Up" | "Down" | "No change";

export type StatementEffect = {
  id: number;
  transaction: string;
  answer: {
    assets: StatementDirection;
    liabilities: StatementDirection;
    equity: StatementDirection;
    netIncome: StatementDirection;
    cash: StatementDirection;
  };
  why: string;
};

export type FormulaItem = {
  label: string;
  formula: string;
};

export type MiniCaseQuestion = {
  prompt: string;
  type: "mcq" | "numeric";
  options?: string[];
  answer: number | string;
  explanation: string;
};

export type MiniCase = {
  id: number;
  title: string;
  mascot: string;
  story: string;
  questions: MiniCaseQuestion[];
};

type SessionBlueprint = {
  size: number;
  quotas: Record<string, number>;
};

type Midterm2Bank = {
  topicRescues: RescueTopic[];
  questionBank: BankQuestion[];
  statementEffects: StatementEffect[];
  formulaSheet: FormulaItem[];
  miniCases: MiniCase[];
  sessionBlueprints: Record<string, SessionBlueprint>;
};

const bank = bankData as Midterm2Bank;

export const topicRescues = bank.topicRescues;
export const questionBank = bank.questionBank;
export const statementEffects = bank.statementEffects;
export const formulaSheet = bank.formulaSheet;
export const miniCases = bank.miniCases;

const sessionBlueprints = bank.sessionBlueprints;

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function takeQuestions(candidates: BankQuestion[], count: number, usedIds: Set<number>) {
  const picks: BankQuestion[] = [];
  for (const item of shuffle(candidates)) {
    if (usedIds.has(item.id)) continue;
    picks.push(item);
    usedIds.add(item.id);
    if (picks.length === count) break;
  }
  return picks;
}

export function buildExamSession(
  mode: string,
  selectedTopic: string,
  missedTopics: Record<string, number>,
  versionSeed = 0
) {
  const allPractice = questionBank.filter((question) => question.family !== "diagnostic");
  const allTopicsPool = selectedTopic === "All"
    ? allPractice
    : allPractice.filter((question) => question.topic === selectedTopic);

  if (mode === "weak") {
    const rankedTopics = Object.entries(missedTopics)
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic);

    if (!rankedTopics.length) return [];

    const weakPool = allPractice.filter((question) => rankedTopics.includes(question.topic));
    return shuffle(weakPool).slice(0, 8);
  }

  if (selectedTopic !== "All") {
    return shuffle(allTopicsPool).slice(0, mode === "mockExam" ? 18 : mode === "mockConfidence" ? 12 : 6);
  }

  const blueprint = sessionBlueprints[mode] || sessionBlueprints.drill;
  const usedIds = new Set<number>();
  const picked: BankQuestion[] = [];

  Object.entries(blueprint.quotas).forEach(([topic, count]) => {
    const candidates = allPractice.filter((question) => question.topic === topic);
    picked.push(...takeQuestions(candidates, count, usedIds));
  });

  if (picked.length < blueprint.size) {
    picked.push(...takeQuestions(allPractice, blueprint.size - picked.length, usedIds));
  }

  if (versionSeed % 2 === 1) {
    return shuffle(picked).slice(0, blueprint.size);
  }

  return picked.slice(0, blueprint.size);
}
