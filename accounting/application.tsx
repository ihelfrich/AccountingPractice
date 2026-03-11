"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Brain, Calculator, Target, Trophy, RefreshCw, Clock3, Heart, CheckCircle2, XCircle, BookOpenText, LineChart, Sparkles, ShieldAlert, Rabbit, RotateCcw, Download, Upload, CalendarDays, TrendingUp, Gauge } from "lucide-react";
import {
  type BankQuestion,
  buildExamSession,
  formulaSheet,
  type MiniCaseQuestion as MiniCaseItem,
  type RescueTopic,
  type StatementDirection,
  type StatementEffect,
  miniCases,
  questionBank,
  statementEffects,
  topicRescues
} from "./midterm2TestBank";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "./studyUi";
import {
  buildCoachHistoryEntry,
  buildConceptPriorities,
  getConceptReviewPack,
  getConceptLessons,
  type CoachHistoryEntry,
  type CoachQuestionRecord,
  type ConceptPriority
} from "./conceptCoach";

const moods = [
  "Tiny steps still count.",
  "You do not need perfect, you need safer.",
  "Do the next clean rep.",
  "Breathe once, then answer the actual question.",
  "Messy focus still beats blank panic.",
  "Survival first, elegance later."
];

type StickerItem = {
  src: string;
  alt: string;
  title: string;
  caption: string;
  tag: string;
  tint: string;
  aspectClass: string;
};

const heroStickerBoard: StickerItem[] = [
  {
    src: "/stickers/cinnamoroll-cookies.webp",
    alt: "Cinnamoroll with a cookie jar",
    title: "Receivables energy",
    caption: "Keep track of what comes in, what gets used, and what still needs to be collected.",
    tag: "Warm-up",
    tint: "from-rose-50 via-white to-sky-50",
    aspectClass: "aspect-[4/3]"
  },
  {
    src: "/stickers/badtz-delivery.webp",
    alt: "Badtz-Maru driving a delivery truck with calculators",
    title: "Inventory in motion",
    caption: "The goods can move fast, but your cost layers still need to stay organized.",
    tag: "Flow",
    tint: "from-amber-50 via-white to-slate-50",
    aspectClass: "aspect-[4/3]"
  },
  {
    src: "/stickers/hello-kitty-boxes.webp",
    alt: "Hello Kitty stacking boxes",
    title: "Sort the layers",
    caption: "Tag the units, label the method, and stop the cost flow question from getting sloppy.",
    tag: "Method",
    tint: "from-rose-50 via-white to-orange-50",
    aspectClass: "aspect-[4/3]"
  },
  {
    src: "/stickers/my-melody-baking.webp",
    alt: "My Melody mixing batter and baking cookies",
    title: "Ingredients to output",
    caption: "When the question feels abstract, go back to the ingredients, process, and finished result.",
    tag: "Process",
    tint: "from-pink-50 via-white to-yellow-50",
    aspectClass: "aspect-[4/3]"
  }
];

const studySupportCards: StickerItem[] = [
  {
    src: "/stickers/keroppi-ingredients.webp",
    alt: "Keroppi with baking ingredients",
    title: "Accrual before cash",
    caption: "Liabilities start when the obligation exists, not only when the payment happens.",
    tag: "Current liabilities",
    tint: "from-lime-50 via-white to-amber-50",
    aspectClass: "aspect-[4/3]"
  },
  {
    src: "/stickers/chococat-boxes.webp",
    alt: "Chococat with stacked boxes",
    title: "Count what stays",
    caption: "A calm box count fixes a surprising number of inventory mistakes before they snowball.",
    tag: "Inventory",
    tint: "from-slate-100 via-white to-rose-50",
    aspectClass: "aspect-[4/3]"
  }
];

const conceptSceneCards: StickerItem[] = [
  {
    src: "/stickers/long-term-asset-acquisition.webp",
    alt: "Long-term asset acquisition diagram",
    title: "Acquire and capitalize",
    caption: "Purchase price, freight, and installation stay with the asset when they prepare it for use.",
    tag: "PP&E setup",
    tint: "from-sky-50 via-white to-rose-50",
    aspectClass: "aspect-[16/10]"
  },
  {
    src: "/stickers/asset-usage-depreciation.webp",
    alt: "Asset usage and depreciation diagram",
    title: "Use, depreciate, compare",
    caption: "Use the asset, update book value, then compare proceeds to book value when it is sold.",
    tag: "Depreciation",
    tint: "from-rose-50 via-white to-amber-50",
    aspectClass: "aspect-[16/10]"
  }
];

const deskFriends: StickerItem[] = [
  {
    src: "/stickers/my-melody-wave.webp",
    alt: "My Melody waving",
    title: "Read twice",
    caption: "Slow down and answer the exact requirement, not the one you expected.",
    tag: "Pacing",
    tint: "from-pink-50 via-white to-rose-50",
    aspectClass: "aspect-square"
  },
  {
    src: "/stickers/hello-kitty-wave.webp",
    alt: "Hello Kitty waving",
    title: "Write clean",
    caption: "Keep the arithmetic neat enough that you can trust your own work under time pressure.",
    tag: "Execution",
    tint: "from-sky-50 via-white to-rose-50",
    aspectClass: "aspect-square"
  }
];

const inventoryFlowCard: StickerItem = {
  src: "/stickers/inventory-flow.webp",
  alt: "Inventory flow shelf diagram",
  title: "Shelf versus COGS",
  caption: "On FIFO/LIFO questions, picture which cost layers stay on the shelf and which ones flow into expense.",
  tag: "Cost flow visual",
  tint: "from-amber-50 via-white to-emerald-50",
  aspectClass: "aspect-[16/9]"
};

const studyBoards: StickerItem[] = [
  {
    src: "/stickers/kawaii-sticker-board.webp",
    alt: "Board of kawaii accounting stickers",
    title: "Mascot sticker board",
    caption: "A softer visual layer for the site: still accounting-focused, just less sterile while you grind through the bank.",
    tag: "Mood board",
    tint: "from-rose-50 via-white to-sky-50",
    aspectClass: "aspect-[16/9]"
  },
  {
    src: "/stickers/kawaii-concept-board.webp",
    alt: "Board of kawaii accounting concept diagrams",
    title: "Concept board",
    caption: "Inventory flow, asset acquisition, depreciation, and sale logic shown as one quick visual board.",
    tag: "Cheat visual",
    tint: "from-sky-50 via-white to-amber-50",
    aspectClass: "aspect-[16/9]"
  }
];

type ActiveSessionMode = "diagnostic" | "drill" | "weak" | "mockConfidence" | "mockExam" | "mistakes";
type ViewMode = "home" | "coach" | "review" | "learn" | "effects" | "cases" | "simulators" | "tvm" | "entries" | "mistakes" | ActiveSessionMode;

type ConfidenceLevel = "Guessing" | "Pretty sure" | "Certain";

type SessionQuestionRecord = {
  question: BankQuestion;
  correct: boolean;
  confidence: ConfidenceLevel;
  secondsSpent: number;
  flagged: boolean;
  answerGiven: string;
  correctAnswer: string;
};

type SessionTopicSummary = {
  topic: string;
  correct: number;
  total: number;
  avgSeconds: number;
  flagged: number;
  overconfidentErrors: number;
};

type SessionSummary = {
  mode: ActiveSessionMode;
  label: string;
  score: number;
  total: number;
  accuracy: number;
  topic: string;
  missedTopics: string[];
  overconfidentErrors: number;
  lowConfidenceWins: number;
  flaggedCount: number;
  totalSeconds: number;
  averageSeconds: number;
  paceTargetSeconds: number;
  paceStatus: "On pace" | "A little slow" | "Too slow";
  recommendedNextStep: string;
  questionRecords: SessionQuestionRecord[];
  topicBreakdown: SessionTopicSummary[];
};

type SessionHistoryEntry = {
  id: string;
  finishedAt: string;
  mode: ActiveSessionMode;
  label: string;
  score: number;
  total: number;
  accuracy: number;
  topic: string;
  flaggedCount: number;
  paceStatus: SessionSummary["paceStatus"];
  totalSeconds: number;
  recommendedNextStep: string;
  missedTopics: string[];
};

type ProgressSnapshot = {
  diagnosticDone: boolean;
  score: number;
  attempts: number;
  streak: number;
  missedTopics: Record<string, number>;
  selectedTopic: string;
  sessionCount: number;
  lastSessionSummary: SessionSummary | null;
  sessionHistory: SessionHistoryEntry[];
  coachHistory: CoachHistoryEntry[];
  mistakeBook: MistakeBookItem[];
  missionDay: string;
  completedMissionIds: string[];
};

type DailyMission = {
  id: string;
  title: string;
  detail: string;
  cta: string;
  tone: "rose" | "emerald" | "sky";
  tag: string;
  onLaunch: () => void;
};

type StatementGuess = Record<keyof StatementEffect["answer"], StatementDirection | "">;

type MistakeBookItem = {
  question: BankQuestion;
  misses: number;
  lastWrongAt: string;
};

type JournalEntryLine = {
  side: "Dr" | "Cr";
  account: string;
  amount: number;
};

type JournalScenario = {
  id: number;
  title: string;
  topic: string;
  prompt: string;
  expected: JournalEntryLine[];
  why: string;
  hint: string;
};

type JournalFeedback = {
  parseErrors: string[];
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  missingLines: string[];
  extraLines: string[];
  matchedLines: string[];
  isCorrect: boolean;
};

type InventoryInputs = {
  beginningUnits: string;
  beginningCost: string;
  purchaseOneUnits: string;
  purchaseOneCost: string;
  purchaseTwoUnits: string;
  purchaseTwoCost: string;
  unitsSold: string;
};

type PpeInputs = {
  purchasePrice: string;
  freight: string;
  installation: string;
  training: string;
  salvage: string;
  usefulLife: string;
  yearsUsed: string;
  salePrice: string;
  revisedSalvage: string;
  revisedRemainingLife: string;
};

type MiniCaseQuestionProps = {
  item: MiniCaseItem;
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  numeric: string;
  setNumeric: React.Dispatch<React.SetStateAction<string>>;
  revealed: boolean;
  setRevealed: React.Dispatch<React.SetStateAction<boolean>>;
  onNext: () => void;
};

type QuestionViewProps = {
  question?: BankQuestion;
  selectedAnswer: string;
  setSelectedAnswer: React.Dispatch<React.SetStateAction<string>>;
  numericInput: string;
  setNumericInput: React.Dispatch<React.SetStateAction<string>>;
  revealed: boolean;
  showHint: boolean;
  setShowHint: React.Dispatch<React.SetStateAction<boolean>>;
  confidence: ConfidenceLevel | "";
  setConfidence: React.Dispatch<React.SetStateAction<ConfidenceLevel | "">>;
  flagged: boolean;
  onToggleFlag: () => void;
  onSubmit: () => void;
  onNext: () => void;
};

const MISTAKE_BOOK_STORAGE_KEY = "accounting_mistake_book_v1";
const PROGRESS_STORAGE_KEY = "accounting_progress_snapshot_v1";

const confidenceOptions: ConfidenceLevel[] = ["Guessing", "Pretty sure", "Certain"];

const defaultInventoryInputs: InventoryInputs = {
  beginningUnits: "18",
  beginningCost: "19",
  purchaseOneUnits: "24",
  purchaseOneCost: "21",
  purchaseTwoUnits: "16",
  purchaseTwoCost: "24",
  unitsSold: "30"
};

const defaultPpeInputs: PpeInputs = {
  purchasePrice: "63000",
  freight: "1200",
  installation: "1800",
  training: "700",
  salvage: "6000",
  usefulLife: "5",
  yearsUsed: "2",
  salePrice: "41000",
  revisedSalvage: "4000",
  revisedRemainingLife: "3"
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const journalScenarios: JournalScenario[] = [
  {
    id: 1,
    title: "Write off an uncollectible account",
    topic: "Receivables & Allowance",
    prompt: "A specific customer account for 1,200 is judged uncollectible under the allowance method. Record the write-off.",
    expected: [
      { side: "Dr", account: "Allowance for Doubtful Accounts", amount: 1200 },
      { side: "Cr", account: "Accounts Receivable", amount: 1200 }
    ],
    why: "A write-off uses the allowance that was built earlier. It does not create new bad debt expense on the write-off date.",
    hint: "Remove the receivable and reduce the contra-asset, not expense."
  },
  {
    id: 2,
    title: "Adjust the allowance upward",
    topic: "Receivables & Allowance",
    prompt: "The desired ending Allowance for Doubtful Accounts is 9,800 and the unadjusted allowance already has a 1,700 credit balance. Record the adjusting entry.",
    expected: [
      { side: "Dr", account: "Bad Debt Expense", amount: 8100 },
      { side: "Cr", account: "Allowance for Doubtful Accounts", amount: 8100 }
    ],
    why: "The adjustment is for the gap between the current allowance balance and the desired ending allowance.",
    hint: "Target ending allowance minus current credit balance gives the adjustment amount."
  },
  {
    id: 3,
    title: "Capitalize asset acquisition cost",
    topic: "PP&E + Intangibles",
    prompt: "A machine costs 63,000, freight is 1,200, installation is 1,800, and training is 700 paid in cash. Record the purchase and setup entry for the capitalized amount only.",
    expected: [
      { side: "Dr", account: "Equipment", amount: 66000 },
      { side: "Cr", account: "Cash", amount: 66000 }
    ],
    why: "Capitalize the purchase price, freight, and installation. Training is expensed separately and is not part of this entry.",
    hint: "Only include costs to acquire and prepare the asset for use."
  },
  {
    id: 4,
    title: "Accrue note interest",
    topic: "Current Liabilities",
    prompt: "A 24,000 note at 12% has been outstanding for 4 months at year-end. Record the interest accrual.",
    expected: [
      { side: "Dr", account: "Interest Expense", amount: 960 },
      { side: "Cr", account: "Interest Payable", amount: 960 }
    ],
    why: "Interest has been incurred over time, so the expense and payable are recognized before cash is paid.",
    hint: "Principal x annual rate x time = accrued interest."
  },
  {
    id: 5,
    title: "Recognize earned revenue from advance cash",
    topic: "Current Liabilities",
    prompt: "A company collected 18,000 cash in advance for a 6-month service contract. After 2 months of service, record the entry to recognize the amount earned.",
    expected: [
      { side: "Dr", account: "Unearned Revenue", amount: 6000 },
      { side: "Cr", account: "Service Revenue", amount: 6000 }
    ],
    why: "Two of the six months have been earned, so one-third of the liability becomes revenue.",
    hint: "Move the earned portion out of the liability account."
  },
  {
    id: 6,
    title: "Record annual straight-line depreciation",
    topic: "PP&E + Intangibles",
    prompt: "Equipment cost 66,000, salvage value is 6,000, and useful life is 5 years. Record one full year of straight-line depreciation.",
    expected: [
      { side: "Dr", account: "Depreciation Expense", amount: 12000 },
      { side: "Cr", account: "Accumulated Depreciation Equipment", amount: 12000 }
    ],
    why: "Annual straight-line depreciation is depreciable base divided by useful life: (66,000 - 6,000) / 5 = 12,000.",
    hint: "Debit the expense, credit accumulated depreciation, not the asset directly."
  },
  {
    id: 7,
    title: "Sell equipment at a gain",
    topic: "PP&E + Intangibles",
    prompt: "Equipment originally cost 66,000 and has accumulated depreciation of 48,000. It is sold for 20,000 cash. Record the disposal.",
    expected: [
      { side: "Dr", account: "Cash", amount: 20000 },
      { side: "Dr", account: "Accumulated Depreciation Equipment", amount: 48000 },
      { side: "Cr", account: "Equipment", amount: 66000 },
      { side: "Cr", account: "Gain on Sale of Equipment", amount: 2000 }
    ],
    why: "Book value is 18,000, so cash proceeds above that amount create a gain. Remove both the asset and its accumulated depreciation.",
    hint: "Get book value first, then compare it with the cash received."
  },
  {
    id: 8,
    title: "Issue a short-term note for cash",
    topic: "Current Liabilities",
    prompt: "A company borrows 24,000 by signing a 6-month note payable. Record the issuance of the note.",
    expected: [
      { side: "Dr", account: "Cash", amount: 24000 },
      { side: "Cr", account: "Notes Payable", amount: 24000 }
    ],
    why: "At issuance, the company receives cash and creates the principal liability. Interest is recognized later over time.",
    hint: "Do not record interest expense on day one unless the question says interest has already accrued."
  }
];

function readNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  return moneyFormatter.format(Math.round(value * 100) / 100);
}

function formatDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function paceTargetSeconds(mode: ActiveSessionMode) {
  switch (mode) {
    case "diagnostic":
      return 75;
    case "drill":
    case "mistakes":
      return 60;
    case "weak":
      return 70;
    case "mockConfidence":
      return 80;
    case "mockExam":
      return 75;
    default:
      return 70;
  }
}

function dedupeQuestions(questions: BankQuestion[]) {
  const seen = new Set<number>();
  return questions.filter((question) => {
    if (seen.has(question.id)) return false;
    seen.add(question.id);
    return true;
  });
}

function buildSessionSummary({
  mode,
  label,
  score,
  total,
  topic,
  records
}: {
  mode: ActiveSessionMode;
  label: string;
  score: number;
  total: number;
  topic: string;
  records: SessionQuestionRecord[];
}): SessionSummary {
  const totalSeconds = records.reduce((sum, record) => sum + record.secondsSpent, 0);
  const averageSeconds = records.length ? totalSeconds / records.length : 0;
  const targetSeconds = paceTargetSeconds(mode);
  const paceStatus = averageSeconds <= targetSeconds
    ? "On pace"
    : averageSeconds <= targetSeconds * 1.25
      ? "A little slow"
      : "Too slow";
  const missedTopics = Array.from(
    records
      .filter((record) => !record.correct)
      .reduce((map, record) => map.set(record.question.topic, (map.get(record.question.topic) || 0) + 1), new Map<string, number>())
      .entries()
  )
    .sort((a, b) => b[1] - a[1])
    .map(([topicName]) => topicName);
  const overconfidentErrors = records.filter((record) => !record.correct && record.confidence === "Certain").length;
  const lowConfidenceWins = records.filter((record) => record.correct && record.confidence === "Guessing").length;
  const flaggedCount = records.filter((record) => record.flagged).length;
  const topicBreakdown = Array.from(
    records.reduce((map, record) => {
      const current = map.get(record.question.topic) ?? { topic: record.question.topic, correct: 0, total: 0, seconds: 0, flagged: 0, overconfidentErrors: 0 };
      current.total += 1;
      current.seconds += record.secondsSpent;
      current.correct += record.correct ? 1 : 0;
      current.flagged += record.flagged ? 1 : 0;
      current.overconfidentErrors += !record.correct && record.confidence === "Certain" ? 1 : 0;
      map.set(record.question.topic, current);
      return map;
    }, new Map<string, { topic: string; correct: number; total: number; seconds: number; flagged: number; overconfidentErrors: number }>())
      .values()
  )
    .map((item) => ({
      topic: item.topic,
      correct: item.correct,
      total: item.total,
      avgSeconds: item.total ? item.seconds / item.total : 0,
      flagged: item.flagged,
      overconfidentErrors: item.overconfidentErrors
    }))
    .sort((a, b) => {
      const aAccuracy = a.total ? a.correct / a.total : 0;
      const bAccuracy = b.total ? b.correct / b.total : 0;
      if (aAccuracy !== bAccuracy) return aAccuracy - bAccuracy;
      return b.total - a.total;
    });

  const worstTopic = topicBreakdown.find((item) => item.correct < item.total)?.topic;
  const recommendedNextStep = flaggedCount >= 2
    ? "Run the flagged review pack before another mock."
    : overconfidentErrors >= 2
      ? "Do a slow explanation round on the overconfident misses before you trust the score."
      : worstTopic
        ? `Recycle ${worstTopic} next. That is where the cleanest points are still leaking.`
        : mode === "mockConfidence"
          ? "Step up to the exam mock while the mix still feels controlled."
          : "Take one more mixed run and try to hold the pace without losing accuracy.";

  return {
    mode,
    label,
    score,
    total,
    accuracy: total ? Math.round((score / total) * 100) : 0,
    topic,
    missedTopics,
    overconfidentErrors,
    lowConfidenceWins,
    flaggedCount,
    totalSeconds,
    averageSeconds,
    paceTargetSeconds: targetSeconds,
    paceStatus,
    recommendedNextStep,
    questionRecords: records,
    topicBreakdown
  };
}

function buildHistoryEntry(summary: SessionSummary): SessionHistoryEntry {
  return {
    id: `${summary.mode}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    finishedAt: new Date().toISOString(),
    mode: summary.mode,
    label: summary.label,
    score: summary.score,
    total: summary.total,
    accuracy: summary.accuracy,
    topic: summary.topic,
    flaggedCount: summary.flaggedCount,
    paceStatus: summary.paceStatus,
    totalSeconds: summary.totalSeconds,
    recommendedNextStep: summary.recommendedNextStep,
    missedTopics: summary.missedTopics
  };
}

function takeEndingInventory(
  layers: Array<{ label: string; units: number; unitCost: number }>,
  endingUnits: number,
  fromNewest: boolean
) {
  let remaining = endingUnits;
  let value = 0;
  const allocations: Array<{ label: string; units: number; unitCost: number }> = [];
  const orderedLayers = fromNewest ? [...layers].reverse() : [...layers];

  orderedLayers.forEach((layer) => {
    if (remaining <= 0 || layer.units <= 0) return;
    const takenUnits = Math.min(remaining, layer.units);
    if (takenUnits > 0) {
      allocations.push({ label: layer.label, units: takenUnits, unitCost: layer.unitCost });
      value += takenUnits * layer.unitCost;
      remaining -= takenUnits;
    }
  });

  return {
    value,
    allocations
  };
}

function buildInventorySimulation(inputs: InventoryInputs) {
  const layers = [
    { label: "Beginning inventory", units: Math.max(0, readNumber(inputs.beginningUnits)), unitCost: Math.max(0, readNumber(inputs.beginningCost)) },
    { label: "Purchase 1", units: Math.max(0, readNumber(inputs.purchaseOneUnits)), unitCost: Math.max(0, readNumber(inputs.purchaseOneCost)) },
    { label: "Purchase 2", units: Math.max(0, readNumber(inputs.purchaseTwoUnits)), unitCost: Math.max(0, readNumber(inputs.purchaseTwoCost)) }
  ];
  const goodsAvailableUnits = layers.reduce((sum, layer) => sum + layer.units, 0);
  const goodsAvailableCost = layers.reduce((sum, layer) => sum + layer.units * layer.unitCost, 0);
  const requestedSoldUnits = Math.max(0, readNumber(inputs.unitsSold));
  const soldUnits = Math.min(requestedSoldUnits, goodsAvailableUnits);
  const endingUnits = Math.max(goodsAvailableUnits - soldUnits, 0);
  const fifo = takeEndingInventory(layers, endingUnits, true);
  const lifo = takeEndingInventory(layers, endingUnits, false);
  const weightedAverageUnitCost = goodsAvailableUnits > 0 ? goodsAvailableCost / goodsAvailableUnits : 0;
  const weightedAverageEndingInventory = endingUnits * weightedAverageUnitCost;
  const nonZeroCosts = layers.filter((layer) => layer.units > 0).map((layer) => layer.unitCost);
  const priceTrend = nonZeroCosts.length >= 2
    ? nonZeroCosts.every((cost, index, all) => index === 0 || cost >= all[index - 1])
      ? "rising"
      : nonZeroCosts.every((cost, index, all) => index === 0 || cost <= all[index - 1])
        ? "falling"
        : "mixed"
    : "mixed";

  return {
    layers,
    goodsAvailableUnits,
    goodsAvailableCost,
    soldUnits,
    requestedSoldUnits,
    endingUnits,
    fifo: {
      endingInventory: fifo.value,
      cogs: goodsAvailableCost - fifo.value,
      allocations: fifo.allocations
    },
    lifo: {
      endingInventory: lifo.value,
      cogs: goodsAvailableCost - lifo.value,
      allocations: lifo.allocations
    },
    weightedAverage: {
      unitCost: weightedAverageUnitCost,
      endingInventory: weightedAverageEndingInventory,
      cogs: goodsAvailableCost - weightedAverageEndingInventory
    },
    warning:
      requestedSoldUnits > goodsAvailableUnits
        ? `Units sold were capped at ${goodsAvailableUnits} because the shelf only has ${goodsAvailableUnits} units available.`
        : "",
    priceTrend
  };
}

function buildPpeSimulation(inputs: PpeInputs) {
  const purchasePrice = Math.max(0, readNumber(inputs.purchasePrice));
  const freight = Math.max(0, readNumber(inputs.freight));
  const installation = Math.max(0, readNumber(inputs.installation));
  const training = Math.max(0, readNumber(inputs.training));
  const salvage = Math.max(0, readNumber(inputs.salvage));
  const usefulLife = Math.max(0, readNumber(inputs.usefulLife));
  const yearsUsed = Math.max(0, readNumber(inputs.yearsUsed));
  const salePrice = Math.max(0, readNumber(inputs.salePrice));
  const revisedSalvage = Math.max(0, readNumber(inputs.revisedSalvage));
  const revisedRemainingLife = Math.max(0, readNumber(inputs.revisedRemainingLife));

  const capitalizedCost = purchasePrice + freight + installation;
  const totalCashPaid = capitalizedCost + training;
  const depreciableBase = Math.max(capitalizedCost - salvage, 0);
  const annualDepreciation = usefulLife > 0 ? depreciableBase / usefulLife : 0;
  const effectiveYearsUsed = usefulLife > 0 ? Math.min(yearsUsed, usefulLife) : 0;
  const accumulatedDepreciation = annualDepreciation * effectiveYearsUsed;
  const bookValue = capitalizedCost - accumulatedDepreciation;
  const revisedDepreciationBase = Math.max(bookValue - revisedSalvage, 0);
  const revisedAnnualDepreciation = revisedRemainingLife > 0 ? revisedDepreciationBase / revisedRemainingLife : 0;
  const saleDifference = salePrice - bookValue;
  const warnings: string[] = [];

  if (salvage > capitalizedCost) {
    warnings.push("Salvage exceeds capitalized cost, so straight-line depreciation is capped at zero until the assumptions are fixed.");
  }
  if (usefulLife === 0) {
    warnings.push("Useful life must be above zero to compute straight-line depreciation.");
  }
  if (yearsUsed > usefulLife && usefulLife > 0) {
    warnings.push("Years used is above useful life, so accumulated depreciation is capped at the full depreciable base.");
  }
  if (revisedRemainingLife === 0) {
    warnings.push("Revised remaining life must be above zero to compute the prospective depreciation after an estimate change.");
  }

  return {
    capitalizedCost,
    trainingExpense: training,
    totalCashPaid,
    depreciableBase,
    annualDepreciation,
    accumulatedDepreciation,
    bookValue,
    revisedAnnualDepreciation,
    saleDifference,
    saleOutcome:
      saleDifference > 0 ? "Gain on disposal" : saleDifference < 0 ? "Loss on disposal" : "No gain or loss",
    warnings
  };
}

function readStoredMistakeBook(): MistakeBookItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MISTAKE_BOOK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MistakeBookItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readStoredProgress(): ProgressSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProgressSnapshot;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function todayLocalKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeAccount(account: string) {
  return account.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function formatJournalLine(line: JournalEntryLine) {
  return `${line.side} ${line.account} ${line.amount.toLocaleString()}`;
}

function parseJournalLines(input: string) {
  const rows = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed: JournalEntryLine[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const match = row.match(/^(dr|debit|cr|credit)\s+(.+?)\s+(-?\$?[\d,]+(?:\.\d+)?)$/i);
    if (!match) {
      errors.push(`Line ${index + 1} should look like "Dr Account Name 100".`);
      return;
    }
    const side = /^(dr|debit)$/i.test(match[1]) ? "Dr" : "Cr";
    const account = match[2].trim();
    const amount = Number(match[3].replace(/[$,]/g, ""));

    if (!account) {
      errors.push(`Line ${index + 1} is missing an account name.`);
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push(`Line ${index + 1} needs a positive numeric amount.`);
      return;
    }

    parsed.push({ side, account, amount });
  });

  return { parsed, errors };
}

function evaluateJournalEntry(input: string, scenario: JournalScenario): JournalFeedback {
  const { parsed, errors } = parseJournalLines(input);
  const totalDebits = parsed.filter((line) => line.side === "Dr").reduce((sum, line) => sum + line.amount, 0);
  const totalCredits = parsed.filter((line) => line.side === "Cr").reduce((sum, line) => sum + line.amount, 0);
  const expectedMap = new Map<string, number>();
  const actualMap = new Map<string, number>();

  scenario.expected.forEach((line) => {
    const key = `${line.side}|${normalizeAccount(line.account)}|${line.amount.toFixed(2)}`;
    expectedMap.set(key, (expectedMap.get(key) ?? 0) + 1);
  });

  parsed.forEach((line) => {
    const key = `${line.side}|${normalizeAccount(line.account)}|${line.amount.toFixed(2)}`;
    actualMap.set(key, (actualMap.get(key) ?? 0) + 1);
  });

  const missingLines: string[] = [];
  const extraLines: string[] = [];
  const matchedLines: string[] = [];

  expectedMap.forEach((count, key) => {
    const actualCount = actualMap.get(key) ?? 0;
    if (actualCount < count) {
      const match = scenario.expected.find((line) => key === `${line.side}|${normalizeAccount(line.account)}|${line.amount.toFixed(2)}`);
      for (let i = 0; i < count - actualCount; i += 1) {
        missingLines.push(match ? formatJournalLine(match) : key);
      }
    } else {
      const match = scenario.expected.find((line) => key === `${line.side}|${normalizeAccount(line.account)}|${line.amount.toFixed(2)}`);
      matchedLines.push(match ? formatJournalLine(match) : key);
    }
  });

  actualMap.forEach((count, key) => {
    const expectedCount = expectedMap.get(key) ?? 0;
    if (count > expectedCount) {
      const match = parsed.find((line) => key === `${line.side}|${normalizeAccount(line.account)}|${line.amount.toFixed(2)}`);
      for (let i = 0; i < count - expectedCount; i += 1) {
        extraLines.push(match ? formatJournalLine(match) : key);
      }
    }
  });

  return {
    parseErrors: errors,
    totalDebits,
    totalCredits,
    isBalanced: totalDebits === totalCredits && parsed.length > 0,
    missingLines,
    extraLines,
    matchedLines,
    isCorrect: errors.length === 0 && totalDebits === totalCredits && missingLines.length === 0 && extraLines.length === 0 && parsed.length === scenario.expected.length
  };
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: LucideIcon }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function StickerTile({ item, compact = false, priority = false }: { item: StickerItem; compact?: boolean; priority?: boolean }) {
  return (
    <div className={`rounded-[1.75rem] border border-white/80 bg-white/85 shadow-sm backdrop-blur ${compact ? "p-2.5" : "p-3.5"}`}>
      <div className={`relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br ${item.tint} ${item.aspectClass}`}>
        <Image
          src={item.src}
          alt={item.alt}
          fill
          priority={priority}
          sizes={compact ? "(max-width: 768px) 50vw, 220px" : "(max-width: 768px) 100vw, 340px"}
          className="object-contain p-3"
        />
      </div>
      <div className={compact ? "mt-2.5 space-y-1" : "mt-3 space-y-1.5"}>
        <Badge variant="outline" className="rounded-full bg-white/80 text-slate-700">{item.tag}</Badge>
        <div className={`font-semibold text-slate-900 ${compact ? "text-sm" : "text-base"}`}>{item.title}</div>
        <div className={`text-slate-600 ${compact ? "text-xs leading-5" : "text-sm leading-6"}`}>{item.caption}</div>
      </div>
    </div>
  );
}

function MascotBubble({ mascot, text }: { mascot: RescueTopic["mascot"]; text: string }) {
  const bg = mascot === "Chococat" ? "bg-slate-900 text-white" : "bg-emerald-100 text-emerald-950";
  return (
    <div className={`rounded-3xl p-4 shadow-sm ${bg}`}>
      <div className="text-xs uppercase tracking-wide opacity-80">{mascot} says</div>
      <div className="mt-1 text-sm leading-6">{text}</div>
    </div>
  );
}

function buildSession(mode: string, selectedTopic: string, missedTopics: Record<string, number>, versionSeed = 0) {
  return buildExamSession(mode, selectedTopic, missedTopics, versionSeed);
}

function gradeStatementEffect(guess: StatementGuess, answer: StatementEffect["answer"]) {
  let correct = 0;
  const keys: Array<keyof StatementEffect["answer"]> = ["assets", "liabilities", "equity", "netIncome", "cash"];
  keys.forEach((k) => {
    if (guess[k] === answer[k]) correct += 1;
  });
  return correct;
}

function isSessionMode(mode: string): mode is ActiveSessionMode {
  return mode === "diagnostic" || mode === "drill" || mode === "weak" || mode === "mockConfidence" || mode === "mockExam" || mode === "mistakes";
}

function modeLabel(mode: ActiveSessionMode) {
  switch (mode) {
    case "diagnostic":
      return "Diagnostic";
    case "drill":
      return "Burst drill";
    case "weak":
      return "Weak spots";
    case "mockConfidence":
      return "Confidence mock";
    case "mockExam":
      return "Exam mock";
    case "mistakes":
      return "Mistake book";
    default:
      return mode;
  }
}

function LabMetric({
  label,
  value,
  note,
  tone = "slate"
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "slate" | "sky" | "emerald" | "amber" | "rose";
}) {
  const toneClasses = {
    slate: "border-slate-200 bg-white text-slate-900",
    sky: "border-sky-100 bg-sky-50 text-sky-950",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-950",
    amber: "border-amber-100 bg-amber-50 text-amber-950",
    rose: "border-rose-100 bg-rose-50 text-rose-950"
  };

  return (
    <div className={`rounded-3xl border p-4 ${toneClasses[tone]}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{label}</div>
      <div className="mt-2 text-2xl font-black">{value}</div>
      {note ? <div className="mt-2 text-sm leading-6 opacity-80">{note}</div> : null}
    </div>
  );
}

function InventoryMethodCard({
  label,
  endingInventory,
  cogs,
  allocations,
  note,
  tone
}: {
  label: string;
  endingInventory: number;
  cogs: number;
  allocations: Array<{ label: string; units: number; unitCost: number }>;
  note: string;
  tone: "sky" | "amber" | "emerald";
}) {
  return (
    <div className="rounded-[1.65rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="text-lg font-semibold text-slate-900">{label}</div>
        <Badge variant="outline" className="rounded-full">{note}</Badge>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <LabMetric label="Ending inventory" value={formatMoney(endingInventory)} tone={tone} />
        <LabMetric label="COGS" value={formatMoney(cogs)} tone="slate" />
      </div>
      <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        {allocations.length
          ? allocations.map((allocation) => `${allocation.units} units from ${allocation.label} @ ${formatMoney(allocation.unitCost)}`).join(" · ")
          : "No ending units left to allocate."}
      </div>
    </div>
  );
}

function PulseRing({
  value,
  label,
  sublabel,
  tone = "emerald",
  size = 112
}: {
  value: number;
  label: string;
  sublabel: string;
  tone?: "emerald" | "rose" | "sky";
  size?: number;
}) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  const tones = {
    emerald: { fill: "#0f766e", glow: "rgba(15, 118, 110, 0.2)" },
    rose: { fill: "#e11d48", glow: "rgba(225, 29, 72, 0.2)" },
    sky: { fill: "#0284c7", glow: "rgba(2, 132, 199, 0.2)" }
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className="relative rounded-full p-2 shadow-sm motion-ring"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${tones[tone].fill} ${safeValue}%, rgba(15,23,42,0.12) ${safeValue}% 100%)`,
          boxShadow: `0 10px 30px ${tones[tone].glow}`
        }}
      >
        <div className="absolute inset-[10px] flex flex-col items-center justify-center rounded-full bg-white/90 text-center">
          <div className="text-2xl font-black text-slate-900">{safeValue}%</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
        </div>
      </div>
      <div className="text-sm leading-6 text-slate-600">{sublabel}</div>
    </div>
  );
}

function DailyMissionCard({
  mission,
  done,
  onToggleDone
}: {
  mission: DailyMission;
  done: boolean;
  onToggleDone: () => void;
}) {
  const toneClasses = {
    rose: "border-rose-100 bg-rose-50/80",
    emerald: "border-emerald-100 bg-emerald-50/80",
    sky: "border-sky-100 bg-sky-50/80"
  };

  return (
    <div className={`rounded-[1.7rem] border p-5 shadow-sm ${toneClasses[mission.tone]} motion-card`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge variant="outline" className="rounded-full bg-white/80">{mission.tag}</Badge>
          <div className="mt-3 text-lg font-semibold text-slate-900">{mission.title}</div>
          <div className="mt-2 text-sm leading-6 text-slate-600">{mission.detail}</div>
        </div>
        <button
          type="button"
          className={`h-8 min-w-8 rounded-full border px-3 text-xs font-semibold transition ${done ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white/80 text-slate-600"}`}
          onClick={onToggleDone}
        >
          {done ? "Done" : "Mark"}
        </button>
      </div>
      <div className="mt-4">
        <Button onClick={mission.onLaunch} variant={done ? "outline" : "default"}>
          {mission.cta}
        </Button>
      </div>
    </div>
  );
}

function CoachPriorityCard({
  priority,
  revealed,
  onToggleAnswer,
  onLaunchFix
}: {
  priority: ConceptPriority;
  revealed: boolean;
  onToggleAnswer: () => void;
  onLaunchFix: () => void;
}) {
  const toneClasses = {
    Urgent: "border-rose-200 bg-rose-50/85",
    Active: "border-amber-200 bg-amber-50/85",
    Reinforce: "border-sky-200 bg-sky-50/85",
    Stable: "border-emerald-200 bg-emerald-50/85"
  };

  return (
    <div className={`rounded-[1.8rem] border p-5 shadow-sm motion-card ${toneClasses[priority.status]}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{priority.lesson.topic}</Badge>
            <Badge variant="outline">{priority.status}</Badge>
            <Badge variant="outline">Priority {priority.score}</Badge>
          </div>
          <div className="mt-3 text-xl font-semibold leading-8 text-slate-900">{priority.lesson.title}</div>
          <div className="mt-2 text-sm leading-6 text-slate-600">{priority.whyNow}</div>
        </div>
        <PulseRing
          value={Math.min(100, Math.max(18, Math.round(priority.score * 2.4)))}
          label="Need"
          sublabel={`${priority.signals.mistakeCount} mistake-book hits · ${priority.signals.latestWrong} recent wrong`}
          tone={priority.status === "Urgent" ? "rose" : priority.status === "Active" ? "sky" : "emerald"}
          size={92}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr,0.9fr]">
        <div className="space-y-4">
          <div className="rounded-3xl bg-white/80 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Teach this now</div>
            <div className="mt-2 text-sm leading-7 text-slate-700">{priority.lesson.teach}</div>
          </div>
          <div className="rounded-3xl bg-white/80 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Exam moves</div>
            <div className="mt-3 grid gap-2">
              {priority.lesson.examMoves.map((move) => (
                <div key={move} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-700">
                  {move}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-white/80 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Classic trap</div>
            <div className="mt-2 text-sm leading-7 text-slate-700">{priority.lesson.trap}</div>
          </div>
          <div className="rounded-3xl bg-white/80 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Retrieval prompt</div>
            <div className="mt-2 text-sm leading-7 text-slate-700">{priority.lesson.retrievalPrompt}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" onClick={onToggleAnswer}>
                {revealed ? "Hide answer" : "Reveal answer"}
              </Button>
              <Button onClick={onLaunchFix}>
                Train this concept
              </Button>
            </div>
            {revealed ? (
              <div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm leading-6 text-emerald-950">{priority.lesson.retrievalAnswer}</div>
            ) : null}
          </div>
          <div className="rounded-3xl bg-white/80 p-4 text-sm leading-6 text-slate-700">
            Matching reps available: <span className="font-semibold text-slate-900">{priority.matchedQuestions.length}</span>
            {" "}· Flagged on latest run: <span className="font-semibold text-slate-900">{priority.signals.flagged}</span>
            {" "}· Certain and wrong: <span className="font-semibold text-slate-900">{priority.signals.overconfidentErrors}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoachHistoryTimeline({
  history,
  currentPriorityIds
}: {
  history: CoachHistoryEntry[];
  currentPriorityIds: string[];
}) {
  if (!history.length) {
    return <div className="rounded-3xl border border-dashed p-8 text-center text-slate-600">No concept history yet. Finish a few sessions and the coach will start logging what Hanna had to learn over time.</div>;
  }

  return (
    <div className="space-y-4">
      {history.map((entry) => (
        <div key={entry.createdAt} className="rounded-[1.8rem] border border-white/70 bg-white/90 p-5 shadow-sm motion-card">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Coach snapshot</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                {new Date(entry.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </div>
            </div>
            <Badge variant="outline">Top six at that moment</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {entry.priorities.map((item) => {
              const stillLive = currentPriorityIds.includes(item.id);
              return (
                <div key={`${entry.createdAt}-${item.id}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{item.topic}</Badge>
                    <Badge variant="outline">{item.status}</Badge>
                    <Badge variant="outline">{stillLive ? "Still active" : "Now calmer"}</Badge>
                  </div>
                  <div className="mt-3 font-semibold text-slate-900">{item.title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">Priority score then: {item.score}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function HistorySparkline({ entries }: { entries: SessionHistoryEntry[] }) {
  if (!entries.length) {
    return <div className="rounded-3xl border border-dashed p-8 text-center text-slate-600">No session history yet. Finish a few runs and the trend board will wake up.</div>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-7">
      {entries.map((entry, index) => (
        <div key={entry.id} className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm motion-card" style={{ animationDelay: `${index * 80}ms` }}>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{modeLabel(entry.mode)}</div>
          <div className="mt-4 flex h-28 items-end">
            <div className="relative h-full w-full overflow-hidden rounded-t-3xl bg-slate-100">
              <div
                className={`w-full rounded-t-3xl transition-all ${entry.accuracy >= 80 ? "bg-emerald-400" : entry.accuracy >= 65 ? "bg-sky-400" : "bg-rose-400"}`}
                style={{ height: `${Math.max(16, entry.accuracy)}%` }}
              />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900">{entry.accuracy}%</div>
          <div className="mt-1 text-xs leading-5 text-slate-500">{new Date(entry.finishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
        </div>
      ))}
    </div>
  );
}

function SessionCockpit({
  progress,
  time,
  flaggedCount,
  score,
  total
}: {
  progress: number;
  time: string;
  flaggedCount: number;
  score: number;
  total: number;
}) {
  return (
    <div className="mb-4 grid gap-4 rounded-[1.75rem] border border-white/70 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-4 shadow-sm md:grid-cols-[auto,1fr] md:items-center">
      <PulseRing
        value={progress}
        label="Progress"
        sublabel={`${score}/${total || 0} correct banked so far`}
        tone={progress >= 70 ? "emerald" : progress >= 35 ? "sky" : "rose"}
        size={96}
      />
      <div className="grid gap-3 md:grid-cols-3">
        <LabMetric label="Elapsed" value={time} note="Live timer for the current run." tone="sky" />
        <LabMetric label="Flagged" value={String(flaggedCount)} note="Questions queued for a second pass." tone="amber" />
        <LabMetric label="Current bank" value={`${score}/${total || 0}`} note="Questions already answered correctly in this run." tone="emerald" />
      </div>
    </div>
  );
}

function MasteryConstellation({
  topics,
  accuracy,
  streak
}: {
  topics: Array<{ topic: string; misses: number; recentTopicAccuracy: number | null; angle: number; mascot: string }>;
  accuracy: number;
  streak: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(125,211,252,0.16),transparent_34%)]" />
      <div className="absolute left-6 top-5 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Mastery constellation</div>
      <div className="relative mx-auto mt-6 h-[22rem] max-w-[28rem]">
        <div className="absolute left-1/2 top-1/2 z-10 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/20 bg-white/10 text-center shadow-2xl backdrop-blur mastery-core">
          <div className="text-xs uppercase tracking-[0.24em] text-white/60">Hanna HQ</div>
          <div className="mt-2 text-3xl font-black">{accuracy}%</div>
          <div className="mt-1 text-xs text-white/70">Current accuracy</div>
          <div className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Streak {streak}</div>
        </div>
        {topics.map((item, index) => {
          const orbitRadius = 132 + (index % 2) * 28;
          const x = Math.cos(item.angle) * orbitRadius;
          const y = Math.sin(item.angle) * orbitRadius;
          const statusTone = item.misses >= 4 ? "border-rose-300 bg-rose-300/20 text-rose-100" : item.misses >= 2 ? "border-amber-300 bg-amber-300/20 text-amber-100" : "border-emerald-300 bg-emerald-300/20 text-emerald-100";
          return (
            <div
              key={item.topic}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                animationDelay: `${index * 180}ms`
              }}
            >
              <div className={`mastery-node min-w-[9rem] rounded-[1.4rem] border px-4 py-3 text-center shadow-lg backdrop-blur ${statusTone}`} style={{ animationDelay: `${index * 180}ms` }}>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">{item.mascot}</div>
                <div className="mt-1 text-sm font-semibold leading-5">{item.topic}</div>
                <div className="mt-2 text-xs opacity-80">
                  {item.recentTopicAccuracy !== null ? `${item.recentTopicAccuracy}% recent` : "No topic history yet"}
                </div>
                <div className="mt-1 text-xs opacity-80">{item.misses} miss{item.misses === 1 ? "" : "es"} logged</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function USCAccountingPracticeTool() {
  const [mode, setMode] = useState<ViewMode>("home");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [sessionQuestions, setSessionQuestions] = useState<BankQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [numericInput, setNumericInput] = useState("");
  const [confidence, setConfidence] = useState<ConfidenceLevel | "">("");
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [diagnosticDone, setDiagnosticDone] = useState(false);
  const [score, setScore] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionMisses, setSessionMisses] = useState<Record<string, number>>({});
  const [sessionConfidenceLog, setSessionConfidenceLog] = useState<Array<{ confidence: ConfidenceLevel; correct: boolean }>>([]);
  const [sessionQuestionLog, setSessionQuestionLog] = useState<SessionQuestionRecord[]>([]);
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<number[]>([]);
  const [activeSessionLabel, setActiveSessionLabel] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [questionStartedAt, setQuestionStartedAt] = useState<number | null>(null);
  const [liveSessionSeconds, setLiveSessionSeconds] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [missedTopics, setMissedTopics] = useState<Record<string, number>>({});
  const [loadedSessionMode, setLoadedSessionMode] = useState<ActiveSessionMode | null>(null);
  const [loadedSessionTopic, setLoadedSessionTopic] = useState("All");
  const [lastSessionSummary, setLastSessionSummary] = useState<SessionSummary | null>(null);
  const [mistakeBook, setMistakeBook] = useState<MistakeBookItem[]>(readStoredMistakeBook);
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryEntry[]>([]);
  const [coachHistory, setCoachHistory] = useState<CoachHistoryEntry[]>([]);
  const [coachView, setCoachView] = useState<"live" | "history">("live");
  const [revealedCoachAnswers, setRevealedCoachAnswers] = useState<string[]>([]);
  const [missionDay, setMissionDay] = useState(todayLocalKey);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
  const [vaultMessage, setVaultMessage] = useState("");
  const [storageReady, setStorageReady] = useState(false);
  const [rescueIndex, setRescueIndex] = useState(0);
  const [rescueFill, setRescueFill] = useState("");
  const [rescueReveal, setRescueReveal] = useState(false);
  const [effectsIndex, setEffectsIndex] = useState(0);
  const [effectGuess, setEffectGuess] = useState<StatementGuess>({
    assets: "",
    liabilities: "",
    equity: "",
    netIncome: "",
    cash: ""
  });
  const [effectRevealed, setEffectRevealed] = useState(false);
  const [effectScore, setEffectScore] = useState<number | null>(null);
  const [caseIndex, setCaseIndex] = useState(0);
  const [caseQuestionIndex, setCaseQuestionIndex] = useState(0);
  const [caseSelected, setCaseSelected] = useState("");
  const [caseNumeric, setCaseNumeric] = useState("");
  const [caseRevealed, setCaseRevealed] = useState(false);
  const [caseScore, setCaseScore] = useState(0);
  const [lastCaseSummary, setLastCaseSummary] = useState<{ title: string; score: number; total: number } | null>(null);
  const [timelineFV, setTimelineFV] = useState("1100");
  const [timelineR, setTimelineR] = useState("10");
  const [timelineN, setTimelineN] = useState("1");
  const [inventoryInputs, setInventoryInputs] = useState<InventoryInputs>(defaultInventoryInputs);
  const [ppeInputs, setPpeInputs] = useState<PpeInputs>(defaultPpeInputs);
  const [journalScenarioIndex, setJournalScenarioIndex] = useState(0);
  const [journalDraft, setJournalDraft] = useState("");
  const [journalFeedback, setJournalFeedback] = useState<JournalFeedback | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const topics = ["All", ...topicRescues.map((t) => t.topic)];
  const diagnosticQuestions = useMemo(() => questionBank.filter((q) => q.family === "diagnostic"), []);
  const currentQuestion = sessionQuestions[questionIndex];
  const currentQuestionFlagged = currentQuestion ? flaggedQuestionIds.includes(currentQuestion.id) : false;
  const accuracy = attempts ? Math.round((score / attempts) * 100) : 0;
  const moodText = moods[(attempts + rescueIndex) % moods.length];
  const rankedWeakTopics = Object.entries(missedTopics).sort((a, b) => b[1] - a[1]);
  const dangerList = rankedWeakTopics.length ? rankedWeakTopics.slice(0, 3).map(([topic]) => topic) : ["No danger list yet", "Run the diagnostic", "Then recycle weak spots"];
  const rescueTopic = topicRescues[rescueIndex];
  const effect = statementEffects[effectsIndex];
  const activeCase = miniCases[caseIndex];
  const activeCaseQuestion = activeCase.questions[caseQuestionIndex];
  const activeJournalScenario = journalScenarios[journalScenarioIndex];
  const inventorySimulation = useMemo(() => buildInventorySimulation(inventoryInputs), [inventoryInputs]);
  const ppeSimulation = useMemo(() => buildPpeSimulation(ppeInputs), [ppeInputs]);
  const prioritizedMistakes = [...mistakeBook].sort((a, b) => {
    if (b.misses !== a.misses) return b.misses - a.misses;
    return new Date(b.lastWrongAt).getTime() - new Date(a.lastWrongAt).getTime();
  });
  const flaggedReviewQuestions = lastSessionSummary
    ? dedupeQuestions(lastSessionSummary.questionRecords.filter((record) => record.flagged).map((record) => record.question))
    : [];
  const missedReviewQuestions = lastSessionSummary
    ? dedupeQuestions(lastSessionSummary.questionRecords.filter((record) => !record.correct).map((record) => record.question))
    : [];
  const overconfidentReviewRecords = lastSessionSummary
    ? lastSessionSummary.questionRecords.filter((record) => !record.correct && record.confidence === "Certain")
    : [];
  const slowestReviewRecords = lastSessionSummary
    ? [...lastSessionSummary.questionRecords].sort((a, b) => b.secondsSpent - a.secondsSpent).slice(0, 3)
    : [];
  const recentHistory = sessionHistory.slice(0, 7).reverse();
  const bestAccuracy = sessionHistory.length ? Math.max(...sessionHistory.map((item) => item.accuracy)) : null;
  const conceptLessons = useMemo(() => getConceptLessons(), []);
  const coachPriorities = useMemo(
    () =>
      buildConceptPriorities({
        questions: questionBank,
        mistakeBook,
        missedTopics,
        latestRecords: (lastSessionSummary?.questionRecords ?? []) as CoachQuestionRecord[],
        sessionHistory: sessionHistory.map((entry) => ({
          topic: entry.topic,
          accuracy: entry.accuracy,
          missedTopics: entry.missedTopics
        }))
      }),
    [lastSessionSummary?.questionRecords, missedTopics, mistakeBook, sessionHistory]
  );
  const topCoachPriorities = coachPriorities.slice(0, 6);
  const currentCoachPriorityIds = topCoachPriorities.map((item) => item.lesson.id);
  const coachedConceptIds = new Set(coachHistory.flatMap((entry) => entry.priorities.map((item) => item.id)));
  const stabilizedConcepts = conceptLessons.filter((lesson) => coachedConceptIds.has(lesson.id) && !topCoachPriorities.some((item) => item.lesson.id === lesson.id));
  const masteryTopics = topicRescues.map((item, index) => {
    const misses = missedTopics[item.topic] || 0;
    const recentForTopic = sessionHistory.filter((entry) => entry.topic === item.topic || entry.missedTopics.includes(item.topic));
    const recentTopicAccuracy = recentForTopic.length
      ? Math.round(recentForTopic.reduce((sum, entry) => sum + entry.accuracy, 0) / recentForTopic.length)
      : null;
    return {
      topic: item.topic,
      misses,
      recentTopicAccuracy,
      angle: (Math.PI * 2 * index) / Math.max(topicRescues.length, 1),
      mascot: item.mascot
    };
  });
  const effectFields: Array<{ key: keyof StatementEffect["answer"]; label: string }> = [
    { key: "assets", label: "Assets" },
    { key: "liabilities", label: "Liabilities" },
    { key: "equity", label: "Equity" },
    { key: "netIncome", label: "Net income" },
    { key: "cash", label: "Cash" }
  ];
  const optionSet: StatementDirection[] = ["Up", "Down", "No change"];
  const todayMissionKey = todayLocalKey();

  const timelinePV = (() => {
    const fv = Number(timelineFV);
    const r = Number(timelineR) / 100;
    const n = Number(timelineN);
    if (!isFinite(fv) || !isFinite(r) || !isFinite(n) || n < 0) return "-";
    return (fv / Math.pow(1 + r, n)).toFixed(2);
  })();

  function resetQuestionState() {
    setSelectedAnswer("");
    setNumericInput("");
    setConfidence("");
    setRevealed(false);
    setShowHint(false);
  }

  useEffect(() => {
    if (!storageReady) return;
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MISTAKE_BOOK_STORAGE_KEY, JSON.stringify(mistakeBook));
  }, [mistakeBook, storageReady]);

  useEffect(() => {
    if (typeof window === "undefined" || !sessionStartedAt || !sessionQuestions.length || !isSessionMode(mode)) {
      setLiveSessionSeconds(0);
      return;
    }

    const updateElapsed = () => setLiveSessionSeconds(Math.max(0, Math.round((Date.now() - sessionStartedAt) / 1000)));
    updateElapsed();
    const timer = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(timer);
  }, [mode, sessionQuestions.length, sessionStartedAt]);

  useEffect(() => {
    const stored = readStoredProgress();
    if (!stored) {
      setStorageReady(true);
      return;
    }

    setDiagnosticDone(Boolean(stored.diagnosticDone));
    setScore(stored.score || 0);
    setAttempts(stored.attempts || 0);
    setStreak(stored.streak || 0);
    setMissedTopics(stored.missedTopics || {});
    setSelectedTopic(stored.selectedTopic || "All");
    setSessionCount(stored.sessionCount || 0);
    setLastSessionSummary(stored.lastSessionSummary || null);
    setSessionHistory(Array.isArray(stored.sessionHistory) ? stored.sessionHistory : []);
    setCoachHistory(Array.isArray(stored.coachHistory) ? stored.coachHistory : []);
    if (Array.isArray(stored.mistakeBook)) {
      setMistakeBook(stored.mistakeBook);
    }
    const resolvedMissionDay = stored.missionDay || todayLocalKey();
    setMissionDay(resolvedMissionDay);
    setCompletedMissionIds(resolvedMissionDay === todayLocalKey() ? stored.completedMissionIds || [] : []);
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (missionDay !== todayMissionKey) {
      setMissionDay(todayMissionKey);
      setCompletedMissionIds([]);
    }
  }, [missionDay, todayMissionKey]);

  useEffect(() => {
    if (!storageReady) return;
    if (typeof window === "undefined") return;
    const snapshot: ProgressSnapshot = {
      diagnosticDone,
      score,
      attempts,
      streak,
      missedTopics,
      selectedTopic,
      sessionCount,
      lastSessionSummary,
      sessionHistory,
      coachHistory,
      mistakeBook,
      missionDay,
      completedMissionIds
    };
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(snapshot));
  }, [
    attempts,
    completedMissionIds,
    diagnosticDone,
    lastSessionSummary,
    missionDay,
    missedTopics,
    mistakeBook,
    score,
    selectedTopic,
    sessionCount,
    coachHistory,
    sessionHistory,
    storageReady,
    streak
  ]);

  function updateMistakeBook(question: BankQuestion) {
    setMistakeBook((prev) => {
      const existing = prev.find((item) => item.question.id === question.id);
      const nextItem: MistakeBookItem = existing
        ? { ...existing, misses: existing.misses + 1, lastWrongAt: new Date().toISOString(), question }
        : { question, misses: 1, lastWrongAt: new Date().toISOString() };

      return [nextItem, ...prev.filter((item) => item.question.id !== question.id)].sort((a, b) => {
        if (b.misses !== a.misses) return b.misses - a.misses;
        return new Date(b.lastWrongAt).getTime() - new Date(a.lastWrongAt).getTime();
      });
    });
  }

  function clearMistake(questionId: number) {
    setMistakeBook((prev) => prev.filter((item) => item.question.id !== questionId));
  }

  function launch(modeName: ActiveSessionMode, options?: { topicOverride?: string; customQuestions?: BankQuestion[]; customTitle?: string }) {
    const topicForSession = options?.topicOverride ?? selectedTopic;
    const nextSession = options?.customQuestions
      ? dedupeQuestions(options.customQuestions)
      : modeName === "diagnostic"
        ? diagnosticQuestions
        : modeName === "mistakes"
          ? prioritizedMistakes.slice(0, 8).map((item) => item.question)
          : buildSession(modeName, topicForSession, missedTopics, sessionCount + 1);
    setMode(modeName);
    setSessionQuestions(nextSession);
    setQuestionIndex(0);
    setSessionScore(0);
    setSessionMisses({});
    setSessionConfidenceLog([]);
    setSessionQuestionLog([]);
    setFlaggedQuestionIds([]);
    setActiveSessionLabel(options?.customTitle ?? modeLabel(modeName));
    setSessionStartedAt(Date.now());
    setQuestionStartedAt(Date.now());
    setLiveSessionSeconds(0);
    setLoadedSessionMode(modeName);
    setLoadedSessionTopic(topicForSession);
    setSessionCount((x: number) => x + 1);
    resetQuestionState();
  }

  function launchReviewPack(questions: BankQuestion[], label: string) {
    if (!questions.length) return;
    launch("drill", {
      customQuestions: questions,
      customTitle: label,
      topicOverride: "Review pack"
    });
  }

  function rerunSession(summary: SessionSummary) {
    if (summary.label !== modeLabel(summary.mode)) {
      launch(summary.mode, {
        customQuestions: summary.questionRecords.map((record) => record.question),
        customTitle: summary.label,
        topicOverride: summary.topic
      });
      return;
    }

    launch(summary.mode, { topicOverride: summary.topic });
  }

  function nextQuestion() {
    if (questionIndex + 1 >= sessionQuestions.length) {
      if (isSessionMode(mode)) {
        const summary = buildSessionSummary({
          mode,
          label: activeSessionLabel ?? modeLabel(mode),
          score: sessionScore,
          total: sessionQuestions.length,
          topic: loadedSessionTopic,
          records: sessionQuestionLog
        });
        setLastSessionSummary(summary);
        setSessionHistory((prev) => [buildHistoryEntry(summary), ...prev].slice(0, 14));
        const coachSnapshot = buildCoachHistoryEntry(
          buildConceptPriorities({
            questions: questionBank,
            mistakeBook,
            missedTopics,
            latestRecords: summary.questionRecords as CoachQuestionRecord[],
            sessionHistory: [
              {
                topic: summary.topic,
                accuracy: summary.accuracy,
                missedTopics: summary.missedTopics
              },
              ...sessionHistory.map((entry) => ({
                topic: entry.topic,
                accuracy: entry.accuracy,
                missedTopics: entry.missedTopics
              }))
            ]
          })
        );
        setCoachHistory((prev) => [coachSnapshot, ...prev].slice(0, 20));
      }
      if (mode === "diagnostic") setDiagnosticDone(true);
      setMode("review");
      setSessionQuestions([]);
      setQuestionIndex(0);
      setSessionScore(0);
      setSessionMisses({});
      setSessionConfidenceLog([]);
      setSessionQuestionLog([]);
      setFlaggedQuestionIds([]);
      setActiveSessionLabel(null);
      setSessionStartedAt(null);
      setQuestionStartedAt(null);
      setLiveSessionSeconds(0);
      setLoadedSessionMode(null);
      resetQuestionState();
      return;
    }
    setQuestionIndex((i: number) => i + 1);
    setQuestionStartedAt(Date.now());
    resetQuestionState();
  }

  function submitQuestion() {
    if (!currentQuestion || revealed || !confidence) return;
    let correct = false;
    if (currentQuestion.type === "mcq" || currentQuestion.type === "classification") {
      correct = String(selectedAnswer).trim().toLowerCase() === String(currentQuestion.answer).trim().toLowerCase();
    } else {
      correct = Math.abs(Number(numericInput) - Number(currentQuestion.answer)) < 0.01;
    }
    const secondsSpent = questionStartedAt ? Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000)) : 0;
    const answerGiven = currentQuestion.type === "numeric" ? numericInput : selectedAnswer;
    const flagged = flaggedQuestionIds.includes(currentQuestion.id);
    setAttempts((a: number) => a + 1);
    setSessionConfidenceLog((prev) => [...prev, { confidence, correct }]);
    setSessionQuestionLog((prev) => [...prev, {
      question: currentQuestion,
      correct,
      confidence,
      secondsSpent,
      flagged,
      answerGiven,
      correctAnswer: String(currentQuestion.answer)
    }]);
    if (correct) {
      setScore((s: number) => s + 1);
      setSessionScore((s: number) => s + 1);
      setStreak((s: number) => s + 1);
      if (mode === "mistakes") {
        clearMistake(currentQuestion.id);
      }
    } else {
      setStreak(0);
      setMissedTopics((prev) => ({ ...prev, [currentQuestion.topic]: (prev[currentQuestion.topic] || 0) + 1 }));
      setSessionMisses((prev) => ({ ...prev, [currentQuestion.topic]: (prev[currentQuestion.topic] || 0) + 1 }));
      updateMistakeBook(currentQuestion);
    }
    setRevealed(true);
  }

  function resetAll() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(MISTAKE_BOOK_STORAGE_KEY);
      window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
    }
    setMode("home");
    setSessionQuestions([]);
    setQuestionIndex(0);
    setSessionScore(0);
    setSessionMisses({});
    setSessionConfidenceLog([]);
    setSessionQuestionLog([]);
    setFlaggedQuestionIds([]);
    setActiveSessionLabel(null);
    setSessionStartedAt(null);
    setQuestionStartedAt(null);
    setLiveSessionSeconds(0);
    setSelectedAnswer("");
    setNumericInput("");
    setConfidence("");
    setRevealed(false);
    setShowHint(false);
    setDiagnosticDone(false);
    setScore(0);
    setAttempts(0);
    setStreak(0);
    setMissedTopics({});
    setLoadedSessionMode(null);
    setLoadedSessionTopic("All");
    setLastSessionSummary(null);
    setMistakeBook([]);
    setSessionHistory([]);
    setCoachHistory([]);
    setCoachView("live");
    setRevealedCoachAnswers([]);
    setMissionDay(todayLocalKey());
    setCompletedMissionIds([]);
    setVaultMessage("");
    setSessionCount(0);
    setRescueIndex(0);
    setRescueFill("");
    setRescueReveal(false);
    setEffectsIndex(0);
    setEffectGuess({ assets: "", liabilities: "", equity: "", netIncome: "", cash: "" });
    setEffectRevealed(false);
    setEffectScore(null);
    setCaseIndex(0);
    setCaseQuestionIndex(0);
    setCaseSelected("");
    setCaseNumeric("");
    setCaseRevealed(false);
    setCaseScore(0);
    setLastCaseSummary(null);
    setTimelineFV("1100");
    setTimelineR("10");
    setTimelineN("1");
    setInventoryInputs(defaultInventoryInputs);
    setPpeInputs(defaultPpeInputs);
    setJournalScenarioIndex(0);
    setJournalDraft("");
    setJournalFeedback(null);
  }

  function handleModeChange(nextMode: string) {
    if (nextMode === "mistakes" || nextMode === "entries" || nextMode === "review") {
      setMode(nextMode as ViewMode);
      return;
    }
    if (isSessionMode(nextMode)) {
      if (loadedSessionMode === nextMode && sessionQuestions.length > 0) {
        setMode(nextMode);
        return;
      }
      launch(nextMode);
      return;
    }
    setMode(nextMode as ViewMode);
  }

  function chooseTopic(topic: string) {
    setSelectedTopic(topic);
    if (mode === "drill") {
      launch("drill", { topicOverride: topic });
    }
  }

  function updateInventoryInput(key: keyof InventoryInputs, value: string) {
    setInventoryInputs((prev) => ({ ...prev, [key]: value }));
  }

  function updatePpeInput(key: keyof PpeInputs, value: string) {
    setPpeInputs((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCurrentQuestionFlag() {
    if (!currentQuestion) return;
    const nextFlagged = !flaggedQuestionIds.includes(currentQuestion.id);
    setFlaggedQuestionIds((prev) =>
      nextFlagged ? [...prev, currentQuestion.id] : prev.filter((id) => id !== currentQuestion.id)
    );
    if (revealed) {
      setSessionQuestionLog((prev) =>
        prev.map((record) =>
          record.question.id === currentQuestion.id ? { ...record, flagged: nextFlagged } : record
        )
      );
    }
  }

  function toggleMissionDone(missionId: string) {
    setCompletedMissionIds((prev) => prev.includes(missionId) ? prev.filter((id) => id !== missionId) : [...prev, missionId]);
  }

  function launchConceptFix(priority: ConceptPriority) {
    const reviewPack = getConceptReviewPack(priority.lesson.id, questionBank);
    if (reviewPack.length) {
      launch("drill", {
        customQuestions: reviewPack,
        customTitle: `${priority.lesson.title} fix pack`,
        topicOverride: priority.lesson.topic
      });
      return;
    }

    switch (priority.lesson.recommendedTool) {
      case "entries":
        setMode("entries");
        return;
      case "simulators":
        setMode("simulators");
        return;
      case "effects":
        setMode("effects");
        return;
      case "tvm":
        setMode("tvm");
        return;
      case "learn":
        setMode("learn");
        return;
      default:
        launch("drill", { topicOverride: priority.lesson.topic });
    }
  }

  function toggleCoachAnswer(lessonId: string) {
    setRevealedCoachAnswers((prev) => prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]);
  }

  function exportProgress() {
    if (typeof window === "undefined") return;
    const payload: ProgressSnapshot = {
      diagnosticDone,
      score,
      attempts,
      streak,
      missedTopics,
      selectedTopic,
      sessionCount,
      lastSessionSummary,
      sessionHistory,
      coachHistory,
      mistakeBook,
      missionDay,
      completedMissionIds
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `hanna-accounting-progress-${todayMissionKey}.json`;
    anchor.click();
    window.URL.revokeObjectURL(url);
    setVaultMessage("Progress exported. Save that JSON file if you want a clean backup or cross-device transfer.");
  }

  async function importProgress(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text()) as Partial<ProgressSnapshot>;
      setDiagnosticDone(Boolean(parsed.diagnosticDone));
      setScore(parsed.score || 0);
      setAttempts(parsed.attempts || 0);
      setStreak(parsed.streak || 0);
      setMissedTopics(parsed.missedTopics || {});
      setSelectedTopic(parsed.selectedTopic || "All");
      setSessionCount(parsed.sessionCount || 0);
      setLastSessionSummary(parsed.lastSessionSummary || null);
      setSessionHistory(Array.isArray(parsed.sessionHistory) ? parsed.sessionHistory : []);
      setCoachHistory(Array.isArray(parsed.coachHistory) ? parsed.coachHistory : []);
      setMistakeBook(Array.isArray(parsed.mistakeBook) ? parsed.mistakeBook : []);
      const importedDay = typeof parsed.missionDay === "string" ? parsed.missionDay : todayMissionKey;
      setMissionDay(importedDay === todayMissionKey ? importedDay : todayMissionKey);
      setCompletedMissionIds(importedDay === todayMissionKey && Array.isArray(parsed.completedMissionIds) ? parsed.completedMissionIds : []);
      setStorageReady(true);
      setVaultMessage("Progress imported. The dashboard, mistake book, and saved history are live again.");
      setMode("home");
    } catch {
      setVaultMessage("Import failed. Use a JSON file that came from this trainer's export button.");
    } finally {
      event.target.value = "";
    }
  }

  function checkJournalEntry() {
    setJournalFeedback(evaluateJournalEntry(journalDraft, activeJournalScenario));
  }

  const isRecoveryRecommended = attempts > 0 && (rankedWeakTopics.length >= 3 || accuracy < 55);
  const sessionProgressValue = sessionQuestions.length ? ((questionIndex + (revealed ? 1 : 0)) / sessionQuestions.length) * 100 : 0;
  const dailyMissions: DailyMission[] = [
    !diagnosticDone
      ? {
          id: `${todayMissionKey}-diagnostic`,
          title: "Run the checkpoint",
          detail: "Start with the 6-question diagnostic so the rest of the plan is based on evidence.",
          cta: "Start diagnostic",
          tone: "rose",
          tag: "Calibration",
          onLaunch: () => launch("diagnostic")
        }
      : {
          id: `${todayMissionKey}-mock`,
          title: "Stabilize the mix",
          detail: "Use an exam-weighted session so the topic blend feels familiar again.",
          cta: lastSessionSummary?.mode === "mockConfidence" ? "Run exam mock" : "Run confidence mock",
          tone: "emerald",
          tag: "Mixed set",
          onLaunch: () => launch(lastSessionSummary?.mode === "mockConfidence" ? "mockExam" : "mockConfidence")
        },
    rankedWeakTopics[0]
      ? {
          id: `${todayMissionKey}-weak-${rankedWeakTopics[0][0]}`,
          title: `Repair ${rankedWeakTopics[0][0]}`,
          detail: `This is the current top leak with ${rankedWeakTopics[0][1]} miss${rankedWeakTopics[0][1] === 1 ? "" : "es"}.`,
          cta: "Launch targeted drill",
          tone: "sky",
          tag: "Weakest topic",
          onLaunch: () => launch("drill", { topicOverride: rankedWeakTopics[0][0] })
        }
      : {
          id: `${todayMissionKey}-learn`,
          title: "Prime the concepts",
          detail: "Use the rescue cards once before you start pushing speed.",
          cta: "Open rescue cards",
          tone: "sky",
          tag: "Prep",
          onLaunch: () => setMode("learn")
        },
    flaggedReviewQuestions.length
      ? {
          id: `${todayMissionKey}-flags`,
          title: "Clear the flagged set",
          detail: "Questions Hanna explicitly marked for another pass are the best cleanup reps right now.",
          cta: "Retry flagged pack",
          tone: "rose",
          tag: "Cleanup",
          onLaunch: () => launchReviewPack(flaggedReviewQuestions, "Flagged review")
        }
      : mistakeBook.length
        ? {
            id: `${todayMissionKey}-mistakes`,
            title: "Empty the mistake book",
            detail: `There are ${mistakeBook.length} saved misses waiting for a clean retry.`,
            cta: "Retry mistakes",
            tone: "rose",
            tag: "Cleanup",
            onLaunch: () => launch("mistakes")
          }
        : {
            id: `${todayMissionKey}-entries`,
            title: "Write one clean entry set",
            detail: "Use the workbench to convert concepts back into debits, credits, and balance checks.",
            cta: "Open entries lab",
            tone: "emerald",
            tag: "Workbench",
            onLaunch: () => setMode("entries")
          }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-rose-100 via-orange-50 to-sky-100 p-4 md:p-8">
      <div className="pointer-events-none absolute -left-16 top-20 h-56 w-56 rounded-full bg-rose-200/60 blur-3xl animate-drift-slow" />
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl animate-drift-reverse" />
      <div className="pointer-events-none absolute bottom-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-100/70 blur-3xl animate-drift-slower" />
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-[8%] top-[14%] h-3 w-3 rounded-full bg-white shadow-[0_0_24px_rgba(255,255,255,0.9)] animate-twinkle" />
        <div className="absolute left-[22%] top-[24%] h-2 w-2 rounded-full bg-amber-200 shadow-[0_0_24px_rgba(253,230,138,0.9)] animate-twinkle-delayed" />
        <div className="absolute right-[18%] top-[18%] h-3 w-3 rounded-full bg-sky-100 shadow-[0_0_24px_rgba(224,242,254,0.9)] animate-twinkle" />
        <div className="absolute right-[12%] top-[34%] h-2.5 w-2.5 rounded-full bg-rose-100 shadow-[0_0_24px_rgba(255,228,230,0.9)] animate-twinkle-delayed" />
        <div className="absolute left-[14%] bottom-[28%] h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_24px_rgba(255,255,255,0.9)] animate-twinkle" />
      </div>
      <div className="relative mx-auto max-w-7xl space-y-6">
        <div>
          <Card className="rounded-[2rem] border border-white/70 bg-white/85 shadow-xl backdrop-blur">
            <CardContent className="p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-[1.25fr,0.75fr] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full bg-rose-100 text-rose-900 hover:bg-rose-100">Midterm 2 Bank</Badge>
                    <Badge variant="outline" className="rounded-full">USC ACCT 410 Midterm 2</Badge>
                    <Badge variant="outline" className="rounded-full">Classes 9-14 aligned</Badge>
                  </div>
                  <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-5xl">Midterm 2 Rescue Lab</h1>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
                    This bank is tuned to the actual Midterm 2 unit: receivables, inventory, PP&E plus intangibles, current liabilities, turnover ratios, and a light TVM layer.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-4">
                    <StatCard label="Accuracy" value={`${accuracy}%`} icon={Trophy} />
                    <StatCard label="Checked" value={attempts} icon={Target} />
                    <StatCard label="Streak" value={streak} icon={Sparkles} />
                    <StatCard label="Danger zones" value={rankedWeakTopics.length} icon={ShieldAlert} />
                  </div>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-[2rem] bg-gradient-to-br from-rose-50 via-white to-sky-50 p-4 shadow-sm motion-card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-rose-500">Mascot board</div>
                        <div className="mt-1 text-sm leading-6 text-slate-600">A lighter-hearted wrapper, but still anchored to the actual Midterm 2 topics.</div>
                      </div>
                      <Badge className="rounded-full bg-white text-slate-700 shadow-sm hover:bg-white">Study crew</Badge>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {heroStickerBoard.map((item, index) => (
                        <div key={item.src} className="motion-card" style={{ animationDelay: `${index * 120}ms` }}>
                          <StickerTile item={item} compact priority={index < 2} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <MascotBubble mascot="Chococat" text="Run the diagnostic, rescue the weakest topic, then use the exam-weighted mocks. Cute does not mean random." />
                  <div className="rounded-3xl bg-white/75 p-4 text-sm text-slate-700 shadow-sm backdrop-blur">
                    <div className="flex items-center gap-2 font-semibold"><Heart className="h-4 w-4 text-rose-500" /> Study note</div>
                    <div className="mt-2 leading-6">One screen, one task, one clean rep. You are not behind, you are just in triage mode.</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr,2.05fr]">
          <div className="space-y-6">
            <Card className="rounded-[2rem] shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> Tonight’s path</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start rounded-2xl py-6 text-left" onClick={() => launch("diagnostic")}>
                  <Brain className="mr-3 h-5 w-5" /> 1. 6-question diagnostic
                </Button>
                <Button className="w-full justify-start rounded-2xl py-6 text-left" variant="secondary" onClick={() => setMode("learn")}>
                  <BookOpenText className="mr-3 h-5 w-5" /> 2. Learn fast with rescue cards
                </Button>
                <Button className="w-full justify-start rounded-2xl py-6 text-left" variant="outline" onClick={() => { setCoachView("live"); setMode("coach"); }}>
                  <Brain className="mr-3 h-5 w-5" /> 3. Adaptive concept coach
                </Button>
                <Button className="w-full justify-start rounded-2xl py-6 text-left" variant="outline" onClick={() => launch("drill")}>
                  <Target className="mr-3 h-5 w-5" /> 4. Drill me in bursts
                </Button>
                <Button className="w-full justify-start rounded-2xl py-6 text-left" variant="outline" onClick={() => launch("weak")}>
                  <RefreshCw className="mr-3 h-5 w-5" /> 5. Recycle weak spots
                </Button>
                <Button className="w-full justify-start rounded-2xl py-6 text-left" variant="outline" onClick={() => setMode("effects")}>
                  <LineChart className="mr-3 h-5 w-5" /> 6. Statement effects lab
                </Button>
                <Button className="w-full justify-start rounded-2xl py-6 text-left" variant="outline" onClick={() => setMode("cases")}>
                  <BookOpenText className="mr-3 h-5 w-5" /> 7. Mini-case lab
                </Button>
                <Button className="w-full justify-start rounded-2xl py-6 text-left" variant="outline" onClick={() => setMode("simulators")}>
                  <Calculator className="mr-3 h-5 w-5" /> 8. Inventory + PP&E simulator
                </Button>
                <Button className="w-full justify-start rounded-2xl py-6 text-left" variant="outline" onClick={() => setMode("tvm")}>
                  <Calculator className="mr-3 h-5 w-5" /> 9. TVM timeline lab
                </Button>
                <Button className="w-full justify-start rounded-2xl py-6 text-left" variant="outline" onClick={() => setMode("entries")}>
                  <BookOpenText className="mr-3 h-5 w-5" /> 10. Journal-entry workbench
                </Button>
                <Button className="w-full justify-start rounded-2xl py-6 text-left" variant="outline" onClick={() => setMode("mistakes")}>
                  <ShieldAlert className="mr-3 h-5 w-5" /> 11. Mistake book
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button className="rounded-2xl py-6" variant="default" onClick={() => launch("mockConfidence")}>
                    <Rabbit className="mr-2 h-5 w-5" /> Confidence mock
                  </Button>
                  <Button className="rounded-2xl py-6" variant="default" onClick={() => launch("mockExam")}>
                    <Clock3 className="mr-2 h-5 w-5" /> Exam mock
                  </Button>
                </div>
                <Button className="w-full rounded-2xl py-6" variant="ghost" onClick={resetAll}>
                  <RotateCcw className="mr-2 h-5 w-5" /> Reset everything
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] shadow-lg">
              <CardHeader><CardTitle>Danger list</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {dangerList.map((topic, i) => (
                  <div key={`${topic}-${i}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                    <span className="font-medium text-slate-800">{i + 1}. {topic}</span>
                    {rankedWeakTopics[i] ? <Badge variant="outline">{rankedWeakTopics[i][1]} misses</Badge> : <Badge variant="outline">start here</Badge>}
                  </div>
                ))}
                <div className="rounded-2xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                  {diagnosticDone ? "Diagnostic done. Rescue the weakest Midterm 2 topic, then recycle misses." : "Run the diagnostic before trusting your feelings. Panic is a terrible course planner."}
                </div>
                <div className="rounded-2xl bg-sky-50 p-3 text-sm leading-6 text-sky-900">
                  Mistake book saved: <span className="font-semibold">{mistakeBook.length}</span> question{mistakeBook.length === 1 ? "" : "s"} waiting for a clean retry.
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] shadow-lg">
              <CardHeader><CardTitle>Recovery mode</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className={`rounded-3xl p-4 text-sm leading-6 ${isRecoveryRecommended ? "bg-rose-50 text-rose-950" : "bg-emerald-50 text-emerald-950"}`}>
                  {isRecoveryRecommended
                    ? "You are probably overloaded. Do this in order: rescue cards for your worst topic, one weak-spots round, then one confidence mock."
                    : "You are stable enough to mix topics. Do a drill burst, then an exam mock, then recycle misses."}
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  Keroppi break: drop shoulders, unclench jaw, one sip of water, then do one more question.
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {deskFriends.map((item) => (
                    <StickerTile key={item.src} item={item} compact />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Tabs value={mode} onValueChange={handleModeChange} className="space-y-4">
              <TabsList className="flex w-full flex-wrap rounded-2xl">
                <TabsTrigger value="home">Home</TabsTrigger>
                <TabsTrigger value="coach">Coach</TabsTrigger>
                <TabsTrigger value="review">Results</TabsTrigger>
                <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
                <TabsTrigger value="learn">Learn</TabsTrigger>
                <TabsTrigger value="drill">Drill</TabsTrigger>
                <TabsTrigger value="weak">Weak</TabsTrigger>
                <TabsTrigger value="effects">Effects</TabsTrigger>
                <TabsTrigger value="cases">Cases</TabsTrigger>
                <TabsTrigger value="simulators">Sims</TabsTrigger>
                <TabsTrigger value="tvm">TVM</TabsTrigger>
                <TabsTrigger value="entries">Entries</TabsTrigger>
                <TabsTrigger value="mistakes">Mistakes</TabsTrigger>
                <TabsTrigger value="mockConfidence">Conf</TabsTrigger>
                <TabsTrigger value="mockExam">Exam</TabsTrigger>
              </TabsList>

              <TabsContent value="home">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader><CardTitle>What this bank now covers</CardTitle></CardHeader>
                  <CardContent className="space-y-4 text-slate-700">
                    {lastSessionSummary ? (
                      <div className="rounded-[1.8rem] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-sky-50 p-5 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Latest run</div>
                            <div className="mt-1 text-2xl font-black text-slate-900">{lastSessionSummary.label}: {lastSessionSummary.score}/{lastSessionSummary.total}</div>
                            <div className="mt-2 text-sm leading-6 text-slate-600">
                              Topic setting: <span className="font-semibold text-slate-800">{lastSessionSummary.topic}</span>
                              {lastSessionSummary.missedTopics.length ? ` · Focus next on ${lastSessionSummary.missedTopics.slice(0, 2).join(" and ")}.` : " · Clean run with no repeated weak spots."}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge variant="outline">Accuracy: {lastSessionSummary.accuracy}%</Badge>
                              <Badge variant="outline">Time: {formatDuration(lastSessionSummary.totalSeconds)}</Badge>
                              <Badge variant="outline">Pace: {lastSessionSummary.paceStatus}</Badge>
                              <Badge variant="outline">Overconfident misses: {lastSessionSummary.overconfidentErrors}</Badge>
                              <Badge variant="outline">Low-confidence wins: {lastSessionSummary.lowConfidenceWins}</Badge>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button onClick={() => rerunSession(lastSessionSummary)}>
                              <RefreshCw className="h-4 w-4" /> Run again
                            </Button>
                            <Button variant="outline" onClick={() => setMode("review")}>
                              <LineChart className="h-4 w-4" /> Open results
                            </Button>
                            <Button variant="outline" onClick={() => launch("weak")} disabled={!rankedWeakTopics.length}>
                              <ShieldAlert className="h-4 w-4" /> Fix misses
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    <div className="rounded-[1.85rem] border border-white/70 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-lg">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">Top 6 to learn next</div>
                          <div className="mt-1 text-sm leading-6 text-white/75">
                            These are ranked from Hanna&apos;s misses, flagged questions, confidence errors, and recurring weak topics.
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button onClick={() => { setCoachView("live"); setMode("coach"); }}>
                            <Brain className="h-4 w-4" /> Open concept coach
                          </Button>
                          <Button variant="outline" onClick={() => { setMode("coach"); setCoachView("history"); }}>
                            History
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {topCoachPriorities.map((priority) => (
                          <div key={priority.lesson.id} className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur motion-card">
                            <div className="flex flex-wrap gap-2">
                              <Badge>{priority.lesson.topic}</Badge>
                              <Badge variant="outline" className="border-white/30 bg-transparent text-white">{priority.status}</Badge>
                            </div>
                            <div className="mt-3 text-lg font-semibold leading-7">{priority.lesson.title}</div>
                            <div className="mt-2 text-sm leading-6 text-white/75">{priority.whyNow}</div>
                            <div className="mt-3 text-xs uppercase tracking-[0.18em] text-amber-200">Teach-back</div>
                            <div className="mt-1 text-sm leading-6 text-white/85">{priority.lesson.retrievalPrompt}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-[1.05fr,0.95fr]">
                      <div className="space-y-4">
                        <div className="rounded-[1.85rem] border border-white/70 bg-white/90 p-5 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-600">Today&apos;s mission board</div>
                              <div className="mt-1 text-sm leading-6 text-slate-600">Three locally-generated tasks based on the current weak spots and saved review work.</div>
                            </div>
                            <Badge variant="outline" className="rounded-full">
                              <CalendarDays className="h-3.5 w-3.5" /> {todayMissionKey}
                            </Badge>
                          </div>
                          <div className="mt-4 grid gap-3">
                            {dailyMissions.map((mission) => (
                              <DailyMissionCard
                                key={mission.id}
                                mission={mission}
                                done={completedMissionIds.includes(mission.id)}
                                onToggleDone={() => toggleMissionDone(mission.id)}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="rounded-[1.85rem] border border-white/70 bg-white/90 p-5 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Progress vault</div>
                              <div className="mt-1 text-sm leading-6 text-slate-600">Export a JSON backup or import one later. That keeps the app fully free-tier and database-free.</div>
                            </div>
                            <Badge variant="outline" className="rounded-full">
                              <Download className="h-3.5 w-3.5" /> Local only
                            </Badge>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button onClick={exportProgress}>
                              <Download className="h-4 w-4" /> Export progress
                            </Button>
                            <Button variant="outline" onClick={() => importInputRef.current?.click()}>
                              <Upload className="h-4 w-4" /> Import progress
                            </Button>
                            <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={importProgress} />
                          </div>
                          <div className="mt-3 rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                            {vaultMessage || "Backups include the mistake book, recent results history, daily mission completion, and saved weak-topic profile."}
                          </div>
                        </div>
                      </div>

                      <MasteryConstellation topics={masteryTopics} accuracy={accuracy} streak={streak} />
                    </div>
                    <div className="rounded-3xl bg-rose-50 p-5 leading-7">
                      This version is now anchored to the practice midterm and Classes 9-14. The sessions are built from a weighted Midterm 2 bank instead of the older generic accounting topic mix.
                    </div>
                    <div className="rounded-[1.85rem] border border-white/70 bg-white/90 p-5 shadow-sm">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Recent trajectory</div>
                          <div className="mt-1 text-sm leading-6 text-slate-600">A lightweight history board saved in the browser. Useful for seeing whether the score trend is actually stabilizing.</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            <TrendingUp className="h-3.5 w-3.5" /> Best accuracy: {bestAccuracy !== null ? `${bestAccuracy}%` : "No runs yet"}
                          </Badge>
                          <Badge variant="outline">
                            <Gauge className="h-3.5 w-3.5" /> Saved runs: {sessionHistory.length}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-4">
                        <HistorySparkline entries={recentHistory} />
                      </div>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      {studyBoards.map((item, index) => (
                        <StickerTile key={item.src} item={item} priority={index === 0} />
                      ))}
                    </div>
                    <div className="rounded-[1.75rem] border border-rose-100 bg-gradient-to-r from-rose-50 via-white to-sky-50 p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="text-sm font-semibold uppercase tracking-wide text-rose-700">Printable extra</div>
                          <div className="mt-1 text-sm leading-6 text-slate-600">
                            I added the kawaii accounting foundations PDF as a downloadable handout so the student can keep the lighter visual theme outside the app too.
                          </div>
                        </div>
                        <a
                          href="/resources/kawaii-accounting-foundations.pdf"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          Open PDF sheet
                        </a>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-3xl border p-5">
                        <div className="font-semibold text-slate-900">Question families</div>
                        <div className="mt-2 text-sm leading-6">Allowance, inventory method, capitalization, depreciation, current liability, ratio, and light TVM reps.</div>
                      </div>
                      <div className="rounded-3xl border p-5">
                        <div className="font-semibold text-slate-900">Best cram sequence</div>
                        <div className="mt-2 text-sm leading-6">Diagnostic, rescue cards, weak spots, confidence mock, then exam mock.</div>
                      </div>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-2">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {studySupportCards.map((item) => (
                          <StickerTile key={item.src} item={item} />
                        ))}
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {conceptSceneCards.map((item) => (
                          <StickerTile key={item.src} item={item} />
                        ))}
                      </div>
                    </div>
                    <MascotBubble mascot="Chococat" text={moodText} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="coach">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <CardTitle>Adaptive concept coach</CardTitle>
                        <div className="mt-2 text-sm leading-6 text-slate-600">
                          Six concepts, ranked by what Hanna is actually missing, flagging, or understanding too shakily to trust yet.
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant={coachView === "live" ? "default" : "outline"} onClick={() => setCoachView("live")}>
                          Live priorities
                        </Button>
                        <Button variant={coachView === "history" ? "default" : "outline"} onClick={() => setCoachView("history")}>
                          History
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {coachView === "live" ? (
                      <>
                        <div className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
                          <div className="rounded-[1.85rem] border border-white/70 bg-gradient-to-r from-emerald-50 via-white to-sky-50 p-5 shadow-sm">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Current teaching queue</div>
                                <div className="mt-1 text-sm leading-6 text-slate-600">
                                  If Hanna learns these six cold, her exam floor rises fast because these are the biggest current leaks or the highest-risk misunderstandings.
                                </div>
                              </div>
                              <PulseRing
                                value={Math.max(12, 100 - Math.min(88, Math.round(topCoachPriorities.reduce((sum, item) => sum + item.score, 0) / Math.max(topCoachPriorities.length, 1))))}
                                label="Coach calm"
                                sublabel="Higher means fewer urgent concept leaks."
                                tone={topCoachPriorities.some((item) => item.status === "Urgent") ? "rose" : "emerald"}
                              />
                            </div>
                          </div>
                          <div className="rounded-[1.85rem] border border-amber-100 bg-amber-50/70 p-5">
                            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">How to use this tool</div>
                            <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                              <div>1. Read the card slowly until Hanna can explain it back in her own words.</div>
                              <div>2. Make her answer the retrieval prompt before revealing the answer.</div>
                              <div>3. Hit the fix-pack button immediately while the idea is still active.</div>
                              <div>4. Come back after the next session to see what left the list and what moved up.</div>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4">
                          {topCoachPriorities.map((priority) => (
                            <CoachPriorityCard
                              key={priority.lesson.id}
                              priority={priority}
                              revealed={revealedCoachAnswers.includes(priority.lesson.id)}
                              onToggleAnswer={() => toggleCoachAnswer(priority.lesson.id)}
                              onLaunchFix={() => launchConceptFix(priority)}
                            />
                          ))}
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[1fr,1fr]">
                          <div className="rounded-[1.85rem] border border-white/70 bg-white/90 p-5 shadow-sm">
                            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Recently stabilized</div>
                            <div className="mt-4 grid gap-3">
                              {stabilizedConcepts.length ? stabilizedConcepts.slice(0, 6).map((lesson) => (
                                <div key={lesson.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                  <div className="flex flex-wrap gap-2">
                                    <Badge>{lesson.topic}</Badge>
                                    <Badge variant="outline">Currently calmer</Badge>
                                  </div>
                                  <div className="mt-3 font-semibold text-slate-900">{lesson.title}</div>
                                  <div className="mt-2 text-sm leading-6 text-slate-600">{lesson.whyItMatters}</div>
                                </div>
                              )) : (
                                <div className="rounded-3xl border border-dashed p-8 text-center text-slate-600">Once concepts leave the top-six queue, they will show up here as stabilized.</div>
                              )}
                            </div>
                          </div>

                          <div className="rounded-[1.85rem] border border-white/70 bg-white/90 p-5 shadow-sm">
                            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Constant reinforcement loop</div>
                            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                              <div>This coach updates whenever question evidence changes, so the list is not static tutoring advice. It is a live diagnosis.</div>
                              <div>Wrong answers raise a concept. Flagged questions keep it alive. Confident misses push it higher. Clean, confident reps gradually calm it down.</div>
                              <div>That means Hanna gets a moving list of what to learn next, plus a record of what used to be weak and is now stabilizing.</div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <CoachHistoryTimeline history={coachHistory} currentPriorityIds={currentCoachPriorityIds} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="review">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <CardTitle>Latest results</CardTitle>
                        <div className="mt-2 text-sm leading-6 text-slate-600">
                          This is the exam-room debrief: score, pace, danger topics, and what the next session should be.
                        </div>
                      </div>
                      {lastSessionSummary ? (
                        <div className="flex flex-wrap gap-2">
                          <Button onClick={() => rerunSession(lastSessionSummary)}>
                            <RefreshCw className="h-4 w-4" /> Run again
                          </Button>
                          <Button variant="outline" onClick={() => setMode("home")}>
                            Back home
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {lastSessionSummary ? (
                      <>
                        <div className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
                          <div className="rounded-[1.85rem] border border-white/70 bg-gradient-to-r from-emerald-50 via-white to-sky-50 p-5 shadow-sm">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">{lastSessionSummary.label}</div>
                                <div className="mt-2 text-4xl font-black text-slate-900">{lastSessionSummary.score} / {lastSessionSummary.total}</div>
                                <div className="mt-2 text-sm leading-6 text-slate-600">
                                  Accuracy {lastSessionSummary.accuracy}% · {formatDuration(lastSessionSummary.totalSeconds)} total · {Math.round(lastSessionSummary.averageSeconds)} sec/question on average.
                                </div>
                              </div>
                              <PulseRing
                                value={lastSessionSummary.accuracy}
                                label="Score"
                                sublabel={`${lastSessionSummary.paceStatus} pace, ${lastSessionSummary.flaggedCount} flagged`}
                                tone={lastSessionSummary.accuracy >= 80 ? "emerald" : lastSessionSummary.accuracy >= 65 ? "sky" : "rose"}
                              />
                            </div>
                            <div className="mt-4 grid gap-3 md:grid-cols-4">
                              <LabMetric label="Pace" value={lastSessionSummary.paceStatus} note={`Target: ${lastSessionSummary.paceTargetSeconds} sec/question`} tone="sky" />
                              <LabMetric label="Flagged" value={String(lastSessionSummary.flaggedCount)} note="Questions Hanna marked for another pass." tone="amber" />
                              <LabMetric label="Overconfident misses" value={String(lastSessionSummary.overconfidentErrors)} note="Wrong while feeling certain." tone="rose" />
                              <LabMetric label="Low-confidence wins" value={String(lastSessionSummary.lowConfidenceWins)} note="Right, but not trusted yet." tone="emerald" />
                            </div>
                          </div>
                          <div className="rounded-[1.85rem] border border-rose-100 bg-rose-50/70 p-5">
                            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-700">Next move</div>
                            <div className="mt-3 text-lg font-semibold leading-8 text-slate-900">{lastSessionSummary.recommendedNextStep}</div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button variant="outline" onClick={() => launchReviewPack(flaggedReviewQuestions, "Flagged review")} disabled={!flaggedReviewQuestions.length}>
                                Retry flagged
                              </Button>
                              <Button variant="outline" onClick={() => launchReviewPack(missedReviewQuestions, "Missed-question review")} disabled={!missedReviewQuestions.length}>
                                Retry misses
                              </Button>
                              <Button variant="outline" onClick={() => { setCoachView("live"); setMode("coach"); }}>
                                Open coach
                              </Button>
                              <Button variant="outline" onClick={() => launch("weak")} disabled={!lastSessionSummary.missedTopics.length}>
                                Weak spots
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[0.95fr,1.05fr]">
                          <div className="rounded-[1.8rem] border border-white/70 bg-white/85 p-5 shadow-sm">
                            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Topic breakdown</div>
                            <div className="mt-4 grid gap-3">
                              {lastSessionSummary.topicBreakdown.map((item) => {
                                const accuracyValue = item.total ? Math.round((item.correct / item.total) * 100) : 0;
                                return (
                                  <div key={item.topic} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                      <div>
                                        <div className="font-semibold text-slate-900">{item.topic}</div>
                                        <div className="mt-1 text-sm leading-6 text-slate-600">
                                          {item.correct} / {item.total} correct · {Math.round(item.avgSeconds)} sec/question average
                                        </div>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline">Accuracy: {accuracyValue}%</Badge>
                                        <Badge variant="outline">Flagged: {item.flagged}</Badge>
                                        <Badge variant="outline">Certain + wrong: {item.overconfidentErrors}</Badge>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="rounded-[1.8rem] border border-amber-100 bg-amber-50/70 p-5">
                              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Slowest questions</div>
                              <div className="mt-4 grid gap-3">
                                {slowestReviewRecords.length ? slowestReviewRecords.map((record) => (
                                  <div key={`slow-${record.question.id}`} className="rounded-3xl border border-amber-100 bg-white/80 p-4">
                                    <div className="flex flex-wrap gap-2">
                                      <Badge>{record.question.topic}</Badge>
                                      <Badge variant="outline">{record.secondsSpent} sec</Badge>
                                      <Badge variant="outline">{record.correct ? "Correct" : "Wrong"}</Badge>
                                    </div>
                                    <div className="mt-3 font-semibold text-slate-900">{record.question.prompt}</div>
                                  </div>
                                )) : (
                                  <div className="rounded-3xl border border-dashed p-6 text-center text-slate-600">No timing data yet.</div>
                                )}
                              </div>
                            </div>

                            <div className="rounded-[1.8rem] border border-rose-100 bg-rose-50/70 p-5">
                              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-700">Overconfident misses</div>
                              <div className="mt-4 grid gap-3">
                                {overconfidentReviewRecords.length ? overconfidentReviewRecords.map((record) => (
                                  <div key={`certain-${record.question.id}`} className="rounded-3xl border border-rose-100 bg-white/80 p-4">
                                    <div className="flex flex-wrap gap-2">
                                      <Badge>{record.question.topic}</Badge>
                                      <Badge variant="outline">Said: {record.answerGiven || "blank"}</Badge>
                                      <Badge variant="outline">Correct: {record.correctAnswer}</Badge>
                                    </div>
                                    <div className="mt-3 font-semibold text-slate-900">{record.question.prompt}</div>
                                    <div className="mt-2 text-sm leading-6 text-slate-600">{record.question.explanation}</div>
                                  </div>
                                )) : (
                                  <div className="rounded-3xl border border-dashed p-6 text-center text-slate-600">No overconfident misses on the last run.</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="rounded-3xl border border-dashed p-10 text-center text-slate-600">
                        Finish one question session first, then the results tab will show pace, topic breakdowns, and retry packs.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="learn">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle>90-second rescue cards</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { setRescueIndex((i) => (i - 1 + topicRescues.length) % topicRescues.length); setRescueFill(""); setRescueReveal(false); }}>Previous</Button>
                        <Button onClick={() => { setRescueIndex((i) => (i + 1) % topicRescues.length); setRescueFill(""); setRescueReveal(false); }}>Next</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="rounded-full">{rescueTopic.topic}</Badge>
                      <Badge variant="outline" className="rounded-full">Coach: {rescueTopic.mascot}</Badge>
                      <Badge variant="outline" className="rounded-full">{rescueTopic.tagline}</Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-3xl bg-slate-50 p-5">
                        <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Teach</div>
                        <div className="mt-2 leading-7 text-slate-800">{rescueTopic.teach}</div>
                      </div>
                      <div className="rounded-3xl bg-emerald-50 p-5">
                        <div className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Formula</div>
                        <div className="mt-2 text-lg font-semibold text-emerald-950">{rescueTopic.formula}</div>
                      </div>
                      <div className="rounded-3xl bg-rose-50 p-5">
                        <div className="text-sm font-semibold uppercase tracking-wide text-rose-700">Worked example</div>
                        <div className="mt-2 leading-7 text-rose-950">{rescueTopic.worked}</div>
                      </div>
                      <div className="rounded-3xl bg-amber-50 p-5">
                        <div className="text-sm font-semibold uppercase tracking-wide text-amber-700">Classic trap</div>
                        <div className="mt-2 leading-7 text-amber-950">{rescueTopic.trap}</div>
                      </div>
                    </div>
                    <div className="rounded-3xl border p-5">
                      <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Finish one</div>
                      <div className="mt-2 leading-7 text-slate-900">{rescueTopic.finishOne}</div>
                      <div className="mt-3 max-w-sm">
                        <Input value={rescueFill} onChange={(e) => setRescueFill(e.target.value)} placeholder="Type your answer" />
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button onClick={() => setRescueReveal(true)}>Reveal</Button>
                        {rescueReveal && <Badge variant="outline">Answer: {rescueTopic.finishAnswer}</Badge>}
                      </div>
                    </div>
                    <MascotBubble mascot={rescueTopic.mascot} text={rescueTopic.memory} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="diagnostic">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle>{activeSessionLabel ?? "6-question diagnostic"}</CardTitle>
                      <div className="w-56"><Progress value={sessionProgressValue} className="h-3" /></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex flex-wrap gap-2">
                      <Badge variant="outline">Run: {activeSessionLabel ?? "Diagnostic"}</Badge>
                      <Badge variant="outline">Question {Math.min(questionIndex + 1, sessionQuestions.length || 1)} / {sessionQuestions.length || 0}</Badge>
                      <Badge variant="outline">Correct this run: {sessionScore}</Badge>
                      <Badge variant="outline">Time: {formatDuration(liveSessionSeconds)}</Badge>
                      <Badge variant="outline">Flagged: {flaggedQuestionIds.length}</Badge>
                    </div>
                    <SessionCockpit progress={sessionProgressValue} time={formatDuration(liveSessionSeconds)} flaggedCount={flaggedQuestionIds.length} score={sessionScore} total={sessionQuestions.length} />
                    <QuestionView question={currentQuestion} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} numericInput={numericInput} setNumericInput={setNumericInput} revealed={revealed} showHint={showHint} setShowHint={setShowHint} confidence={confidence} setConfidence={setConfidence} flagged={currentQuestionFlagged} onToggleFlag={toggleCurrentQuestionFlag} onSubmit={submitQuestion} onNext={nextQuestion} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="drill">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle>{activeSessionLabel ?? "Burst drill"}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        {topics.map((topic) => (
                          <Button key={topic} variant={selectedTopic === topic ? "default" : "outline"} className="rounded-full" onClick={() => chooseTopic(topic)}>{topic}</Button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      {activeSessionLabel && activeSessionLabel !== modeLabel("drill")
                        ? "This pack was built from the latest results. Clean it up before going back into a full mixed drill."
                        : "Six quick reps pulled from the dynamic Midterm 2 bank. Topic changes now relaunch the drill immediately instead of leaving you on a stale set."}
                    </div>
                    <div className="mb-4 flex flex-wrap gap-2">
                      <Badge variant="outline">Run: {activeSessionLabel ?? "Burst drill"}</Badge>
                      <Badge variant="outline">Topic: {loadedSessionTopic}</Badge>
                      <Badge variant="outline">Question {Math.min(questionIndex + 1, sessionQuestions.length || 1)} / {sessionQuestions.length || 0}</Badge>
                      <Badge variant="outline">Correct this run: {sessionScore}</Badge>
                      <Badge variant="outline">Time: {formatDuration(liveSessionSeconds)}</Badge>
                      <Badge variant="outline">Flagged: {flaggedQuestionIds.length}</Badge>
                    </div>
                    <SessionCockpit progress={sessionProgressValue} time={formatDuration(liveSessionSeconds)} flaggedCount={flaggedQuestionIds.length} score={sessionScore} total={sessionQuestions.length} />
                    <QuestionView question={currentQuestion} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} numericInput={numericInput} setNumericInput={setNumericInput} revealed={revealed} showHint={showHint} setShowHint={setShowHint} confidence={confidence} setConfidence={setConfidence} flagged={currentQuestionFlagged} onToggleFlag={toggleCurrentQuestionFlag} onSubmit={submitQuestion} onNext={nextQuestion} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="weak">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader><CardTitle>{activeSessionLabel ?? "Weak spots recycle"}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">This pulls from the topics you have missed most. Good. That means it is doing its job.</div>
                    {sessionQuestions.length ? (
                      <>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Run: {activeSessionLabel ?? "Weak spots"}</Badge>
                          <Badge variant="outline">Question {Math.min(questionIndex + 1, sessionQuestions.length || 1)} / {sessionQuestions.length || 0}</Badge>
                          <Badge variant="outline">Correct this run: {sessionScore}</Badge>
                          <Badge variant="outline">Time: {formatDuration(liveSessionSeconds)}</Badge>
                          <Badge variant="outline">Flagged: {flaggedQuestionIds.length}</Badge>
                        </div>
                        <SessionCockpit progress={sessionProgressValue} time={formatDuration(liveSessionSeconds)} flaggedCount={flaggedQuestionIds.length} score={sessionScore} total={sessionQuestions.length} />
                        <QuestionView question={currentQuestion} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} numericInput={numericInput} setNumericInput={setNumericInput} revealed={revealed} showHint={showHint} setShowHint={setShowHint} confidence={confidence} setConfidence={setConfidence} flagged={currentQuestionFlagged} onToggleFlag={toggleCurrentQuestionFlag} onSubmit={submitQuestion} onNext={nextQuestion} />
                      </>
                    ) : (
                      <div className="rounded-3xl border border-dashed p-8 text-center text-slate-600">Miss a few questions first, then come back here and let the app bully the right topics.</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="effects">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle>Statement effects lab</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { setEffectsIndex((i) => (i - 1 + statementEffects.length) % statementEffects.length); setEffectGuess({ assets: "", liabilities: "", equity: "", netIncome: "", cash: "" }); setEffectRevealed(false); setEffectScore(null); }}>Previous</Button>
                        <Button onClick={() => { setEffectsIndex((i) => (i + 1) % statementEffects.length); setEffectGuess({ assets: "", liabilities: "", equity: "", netIncome: "", cash: "" }); setEffectRevealed(false); setEffectScore(null); }}>Next</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="rounded-3xl bg-slate-50 p-5 text-lg font-medium text-slate-900">{effect.transaction}</div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                      {effectFields.map((field) => (
                        <div key={field.key} className="rounded-3xl border p-4">
                          <div className="font-semibold text-slate-900">{field.label}</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {optionSet.map((option) => (
                              <Button key={option} variant={effectGuess[field.key] === option ? "default" : "outline"} className="rounded-full" onClick={() => !effectRevealed && setEffectGuess((prev) => ({ ...prev, [field.key]: option }))}>{option}</Button>
                            ))}
                          </div>
                          {effectRevealed && <div className="mt-3 text-sm text-slate-600">Correct: <span className="font-semibold">{effect.answer[field.key]}</span></div>}
                        </div>
                      ))}
                    </div>
                    {!effectRevealed ? (
                      <div className="flex gap-2">
                        <Button onClick={() => { setEffectScore(gradeStatementEffect(effectGuess, effect.answer)); setEffectRevealed(true); }}>Check grid</Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="rounded-3xl bg-emerald-50 p-4 leading-7 text-emerald-950">{effect.why}</div>
                        <div className="rounded-3xl bg-slate-50 p-4 text-sm font-medium text-slate-700">Grid score: {effectScore} / 5 correct</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cases">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle>Mini-case lab</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { setCaseIndex((i) => (i - 1 + miniCases.length) % miniCases.length); setCaseQuestionIndex(0); setCaseSelected(""); setCaseNumeric(""); setCaseRevealed(false); setCaseScore(0); setLastCaseSummary(null); }}>Previous case</Button>
                        <Button onClick={() => { setCaseIndex((i) => (i + 1) % miniCases.length); setCaseQuestionIndex(0); setCaseSelected(""); setCaseNumeric(""); setCaseRevealed(false); setCaseScore(0); setLastCaseSummary(null); }}>Next case</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{activeCase.title}</Badge>
                      <Badge variant="outline">Coach: {activeCase.mascot}</Badge>
                      <Badge variant="outline">Question {caseQuestionIndex + 1} of {activeCase.questions.length}</Badge>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-5 leading-7 text-slate-800">{activeCase.story}</div>
                    <MiniCaseQuestion
                      item={activeCaseQuestion}
                      selected={caseSelected}
                      setSelected={setCaseSelected}
                      numeric={caseNumeric}
                      setNumeric={setCaseNumeric}
                      revealed={caseRevealed}
                      setRevealed={setCaseRevealed}
                      onNext={() => {
                        const correct = activeCaseQuestion.type === "numeric"
                          ? Math.abs(Number(caseNumeric) - Number(activeCaseQuestion.answer)) < 0.01
                          : String(caseSelected).trim().toLowerCase() === String(activeCaseQuestion.answer).trim().toLowerCase();
                        const updatedScore = correct ? caseScore + 1 : caseScore;
                        if (caseQuestionIndex + 1 < activeCase.questions.length) {
                          setCaseScore(updatedScore);
                          setCaseQuestionIndex((i) => i + 1);
                          setCaseSelected("");
                          setCaseNumeric("");
                          setCaseRevealed(false);
                        } else {
                          setLastCaseSummary({ title: activeCase.title, score: updatedScore, total: activeCase.questions.length });
                          setCaseQuestionIndex(0);
                          setCaseSelected("");
                          setCaseNumeric("");
                          setCaseRevealed(false);
                          setCaseScore(0);
                        }
                      }}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-3xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">Current run banked score: {caseScore}</div>
                      <div className="rounded-3xl bg-sky-50 p-4 text-sm leading-6 text-sky-950">{lastCaseSummary ? `Last completed run on ${lastCaseSummary.title}: ${lastCaseSummary.score} / ${lastCaseSummary.total}` : "Finish a full case once to store a completed-run score."}</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="simulators">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <CardTitle>Inventory + PP&amp;E simulator lab</CardTitle>
                        <div className="mt-2 text-sm leading-6 text-slate-600">
                          Live sandboxes for the two biggest Midterm 2 calculation clusters. Change the inputs and watch the accounting story move immediately.
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => setInventoryInputs(defaultInventoryInputs)}>Reset inventory case</Button>
                        <Button variant="outline" onClick={() => setPpeInputs(defaultPpeInputs)}>Reset PP&amp;E case</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-[1.8rem] border border-white/70 bg-gradient-to-r from-rose-50 via-white to-sky-50 p-5 shadow-sm">
                      <div className="grid gap-4 lg:grid-cols-3">
                        <LabMetric
                          label="Why this matters"
                          value="Exam patterns"
                          note="Inventory methods and PP&E math are where students usually lose clean points even when they know the vocabulary."
                          tone="rose"
                        />
                        <LabMetric
                          label="How to use it"
                          value="Change one input"
                          note="Do not randomize everything at once. Change one number, predict the direction first, then check the output."
                          tone="sky"
                        />
                        <LabMetric
                          label="Best habit"
                          value="Narrate the flow"
                          note="Say what stays on the shelf, what becomes expense, and what becomes book value. That narration is what carries into exam questions."
                          tone="emerald"
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                      <div className="space-y-5 rounded-[1.85rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Inventory cost-flow lab</div>
                            <div className="mt-1 text-sm leading-6 text-slate-600">Periodic FIFO, periodic LIFO, and weighted average from one shelf.</div>
                          </div>
                          <Badge variant="outline" className="rounded-full">Units sold: {inventorySimulation.soldUnits}</Badge>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <div>
                            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Beg units</div>
                            <Input value={inventoryInputs.beginningUnits} onChange={(event) => updateInventoryInput("beginningUnits", event.target.value)} />
                          </div>
                          <div>
                            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Beg unit cost</div>
                            <Input value={inventoryInputs.beginningCost} onChange={(event) => updateInventoryInput("beginningCost", event.target.value)} />
                          </div>
                          <div>
                            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Purchase 1 units</div>
                            <Input value={inventoryInputs.purchaseOneUnits} onChange={(event) => updateInventoryInput("purchaseOneUnits", event.target.value)} />
                          </div>
                          <div>
                            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Purchase 1 cost</div>
                            <Input value={inventoryInputs.purchaseOneCost} onChange={(event) => updateInventoryInput("purchaseOneCost", event.target.value)} />
                          </div>
                          <div>
                            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Purchase 2 units</div>
                            <Input value={inventoryInputs.purchaseTwoUnits} onChange={(event) => updateInventoryInput("purchaseTwoUnits", event.target.value)} />
                          </div>
                          <div>
                            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Purchase 2 cost</div>
                            <Input value={inventoryInputs.purchaseTwoCost} onChange={(event) => updateInventoryInput("purchaseTwoCost", event.target.value)} />
                          </div>
                          <div className="sm:col-span-2">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Units sold</div>
                            <Input value={inventoryInputs.unitsSold} onChange={(event) => updateInventoryInput("unitsSold", event.target.value)} />
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                          {inventorySimulation.layers.map((layer, index) => {
                            const widthPercent = inventorySimulation.goodsAvailableUnits
                              ? Math.max(10, (layer.units / inventorySimulation.goodsAvailableUnits) * 100)
                              : 0;
                            return (
                              <div key={layer.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <div className="text-sm font-semibold text-slate-900">{layer.label}</div>
                                <div className="mt-1 text-sm leading-6 text-slate-600">
                                  {layer.units} units at {formatMoney(layer.unitCost)} each
                                </div>
                                <div className="mt-3 h-2 rounded-full bg-white">
                                  <div
                                    className={`h-2 rounded-full ${index === 0 ? "bg-rose-300" : index === 1 ? "bg-amber-300" : "bg-sky-300"}`}
                                    style={{ width: `${widthPercent}%` }}
                                  />
                                </div>
                                <div className="mt-3 text-sm font-semibold text-slate-700">Layer cost: {formatMoney(layer.units * layer.unitCost)}</div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                          <LabMetric label="Goods available" value={`${inventorySimulation.goodsAvailableUnits} units`} note={formatMoney(inventorySimulation.goodsAvailableCost)} tone="sky" />
                          <LabMetric label="Ending units" value={`${inventorySimulation.endingUnits} units`} note="Units still sitting on the shelf at period end." tone="emerald" />
                          <LabMetric label="Weighted avg" value={formatMoney(inventorySimulation.weightedAverage.unitCost)} note="Average cost per unit across all units available." tone="amber" />
                        </div>

                        {inventorySimulation.warning ? (
                          <div className="rounded-3xl bg-rose-50 p-4 text-sm leading-6 text-rose-950">{inventorySimulation.warning}</div>
                        ) : null}

                        <div className="grid gap-4">
                          <InventoryMethodCard
                            label="FIFO"
                            endingInventory={inventorySimulation.fifo.endingInventory}
                            cogs={inventorySimulation.fifo.cogs}
                            allocations={inventorySimulation.fifo.allocations}
                            note="Ending inventory keeps the newest costs."
                            tone="sky"
                          />
                          <InventoryMethodCard
                            label="LIFO"
                            endingInventory={inventorySimulation.lifo.endingInventory}
                            cogs={inventorySimulation.lifo.cogs}
                            allocations={inventorySimulation.lifo.allocations}
                            note="Ending inventory keeps the oldest costs."
                            tone="amber"
                          />
                          <div className="rounded-[1.65rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
                            <div className="flex items-center justify-between gap-3">
                              <div className="text-lg font-semibold text-slate-900">Weighted average</div>
                              <Badge variant="outline" className="rounded-full">One pooled unit cost</Badge>
                            </div>
                            <div className="mt-4 grid gap-3 md:grid-cols-3">
                              <LabMetric label="Avg unit cost" value={formatMoney(inventorySimulation.weightedAverage.unitCost)} tone="emerald" />
                              <LabMetric label="Ending inventory" value={formatMoney(inventorySimulation.weightedAverage.endingInventory)} tone="sky" />
                              <LabMetric label="COGS" value={formatMoney(inventorySimulation.weightedAverage.cogs)} tone="slate" />
                            </div>
                            <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                              Weighted average smooths the layers into one per-unit amount, so it usually lands between FIFO and LIFO when costs are moving.
                            </div>
                          </div>
                        </div>

                        <div className="rounded-3xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                          {inventorySimulation.priceTrend === "rising"
                            ? "Costs are rising across the layers here. That means FIFO leaves the most recent expensive units in ending inventory and usually reports lower COGS than LIFO."
                            : inventorySimulation.priceTrend === "falling"
                              ? "Costs are falling across the layers here. That flips the usual rising-price intuition, so watch which method leaves the cheaper units in ending inventory."
                              : "Costs are not moving in a clean one-direction trend here, so rely on the actual layer logic instead of a memorized directional shortcut."}
                        </div>
                      </div>

                      <div className="space-y-5 rounded-[1.85rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-700">PP&amp;E depreciation + disposal lab</div>
                            <div className="mt-1 text-sm leading-6 text-slate-600">See what gets capitalized, what gets expensed, how book value changes, and what sale price does at disposal.</div>
                          </div>
                          <Badge variant="outline" className="rounded-full">Prospective estimate change included</Badge>
                        </div>

                        <div className="grid gap-4">
                          <div className="rounded-3xl border border-rose-100 bg-rose-50/70 p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">Acquisition inputs</div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              <div>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Purchase price</div>
                                <Input value={ppeInputs.purchasePrice} onChange={(event) => updatePpeInput("purchasePrice", event.target.value)} />
                              </div>
                              <div>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Freight</div>
                                <Input value={ppeInputs.freight} onChange={(event) => updatePpeInput("freight", event.target.value)} />
                              </div>
                              <div>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Installation</div>
                                <Input value={ppeInputs.installation} onChange={(event) => updatePpeInput("installation", event.target.value)} />
                              </div>
                              <div>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Training expense</div>
                                <Input value={ppeInputs.training} onChange={(event) => updatePpeInput("training", event.target.value)} />
                              </div>
                            </div>
                          </div>

                          <div className="rounded-3xl border border-sky-100 bg-sky-50/70 p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Depreciation inputs</div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              <div>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Salvage value</div>
                                <Input value={ppeInputs.salvage} onChange={(event) => updatePpeInput("salvage", event.target.value)} />
                              </div>
                              <div>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Useful life (years)</div>
                                <Input value={ppeInputs.usefulLife} onChange={(event) => updatePpeInput("usefulLife", event.target.value)} />
                              </div>
                              <div>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Years used</div>
                                <Input value={ppeInputs.yearsUsed} onChange={(event) => updatePpeInput("yearsUsed", event.target.value)} />
                              </div>
                              <div>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Sale price now</div>
                                <Input value={ppeInputs.salePrice} onChange={(event) => updatePpeInput("salePrice", event.target.value)} />
                              </div>
                            </div>
                          </div>

                          <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-4">
                            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Change in estimate</div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              <div>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Revised salvage</div>
                                <Input value={ppeInputs.revisedSalvage} onChange={(event) => updatePpeInput("revisedSalvage", event.target.value)} />
                              </div>
                              <div>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Revised remaining life</div>
                                <Input value={ppeInputs.revisedRemainingLife} onChange={(event) => updatePpeInput("revisedRemainingLife", event.target.value)} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <LabMetric label="Cash paid" value={formatMoney(ppeSimulation.totalCashPaid)} note="Everything paid up front in this setup." tone="slate" />
                          <LabMetric label="Capitalize now" value={formatMoney(ppeSimulation.capitalizedCost)} note="Purchase price + freight + installation." tone="rose" />
                          <LabMetric label="Expense now" value={formatMoney(ppeSimulation.trainingExpense)} note="Training does not create future service potential." tone="amber" />
                          <LabMetric label="Depreciable base" value={formatMoney(ppeSimulation.depreciableBase)} note="Capitalized cost minus salvage." tone="sky" />
                          <LabMetric label="Annual straight-line depreciation" value={formatMoney(ppeSimulation.annualDepreciation)} note="Original estimate." tone="emerald" />
                          <LabMetric label="Accumulated depreciation" value={formatMoney(ppeSimulation.accumulatedDepreciation)} note="Based on years already used." tone="sky" />
                          <LabMetric label="Book value now" value={formatMoney(ppeSimulation.bookValue)} note="Asset cost less accumulated depreciation." tone="rose" />
                          <LabMetric label="New annual depreciation" value={formatMoney(ppeSimulation.revisedAnnualDepreciation)} note="Prospective only after the estimate change." tone="emerald" />
                          <LabMetric label={ppeSimulation.saleOutcome} value={formatMoney(Math.abs(ppeSimulation.saleDifference))} note={`${formatMoney(readNumber(ppeInputs.salePrice))} sale proceeds compared with current book value.`} tone={ppeSimulation.saleDifference >= 0 ? "sky" : "amber"} />
                        </div>

                        {ppeSimulation.warnings.length ? (
                          <div className="rounded-3xl bg-rose-50 p-4 text-sm leading-6 text-rose-950">
                            {ppeSimulation.warnings.join(" ")}
                          </div>
                        ) : null}

                        <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                          Estimate changes are prospective. Do not go back and restate old depreciation. Recompute from current book value using the revised salvage and remaining life.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tvm">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader><CardTitle>TVM timeline lab</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div><div className="mb-2 text-sm font-medium text-slate-600">Future value</div><Input value={timelineFV} onChange={(e) => setTimelineFV(e.target.value)} /></div>
                      <div><div className="mb-2 text-sm font-medium text-slate-600">Discount rate (%)</div><Input value={timelineR} onChange={(e) => setTimelineR(e.target.value)} /></div>
                      <div><div className="mb-2 text-sm font-medium text-slate-600">Years</div><Input value={timelineN} onChange={(e) => setTimelineN(e.target.value)} /></div>
                    </div>
                    <div className="rounded-[2rem] border bg-slate-50 p-6">
                      <div className="flex items-center justify-between text-sm text-slate-500"><span>Now</span><span>Year {timelineN || "n"}</span></div>
                      <div className="relative mt-6 h-16">
                        <div className="absolute top-7 h-1 w-full rounded-full bg-slate-300" />
                        <div className="absolute left-0 top-3 h-8 w-8 rounded-full bg-slate-900" />
                        <div className="absolute right-0 top-3 h-8 w-8 rounded-full bg-emerald-500" />
                        <div className="absolute left-0 top-12 text-xs text-slate-600">PV = {timelinePV}</div>
                        <div className="absolute right-0 top-12 text-xs text-slate-600">FV = {timelineFV}</div>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-3xl bg-emerald-50 p-5"><div className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Result</div><div className="mt-2 text-3xl font-black text-emerald-950">PV = {timelinePV}</div></div>
                      <div className="rounded-3xl bg-amber-50 p-5 leading-7 text-amber-950">Keroppi reminder: draw the timeline first. If the cash is later and you want today’s value, discount it back.</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="entries">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle>Journal-entry workbench</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { setJournalScenarioIndex((i) => (i - 1 + journalScenarios.length) % journalScenarios.length); setJournalDraft(""); setJournalFeedback(null); }}>Previous</Button>
                        <Button onClick={() => { setJournalScenarioIndex((i) => (i + 1) % journalScenarios.length); setJournalDraft(""); setJournalFeedback(null); }}>Next</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex flex-wrap gap-2">
                      <Badge>{activeJournalScenario.topic}</Badge>
                      <Badge variant="outline">{activeJournalScenario.title}</Badge>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-5 leading-7 text-slate-800">{activeJournalScenario.prompt}</div>
                    <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
                      <div className="space-y-3">
                        <div className="rounded-3xl border p-5">
                          <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Entry format</div>
                          <div className="mt-2 text-sm leading-6 text-slate-600">One line per posting. Example: <span className="font-semibold text-slate-900">Dr Interest Expense 960</span></div>
                          <textarea
                            value={journalDraft}
                            onChange={(event) => setJournalDraft(event.target.value)}
                            placeholder={"Dr Account Name 100\nCr Account Name 100"}
                            className="mt-4 min-h-56 w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500"
                          />
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button onClick={checkJournalEntry}>Check entry</Button>
                            <Button variant="outline" onClick={() => setJournalDraft(activeJournalScenario.expected.map(formatJournalLine).join("\n"))}>Load model answer</Button>
                          </div>
                        </div>
                        <div className="rounded-3xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">Hint: {activeJournalScenario.hint}</div>
                      </div>
                      <div className="space-y-3">
                        <div className="rounded-3xl border p-5">
                          <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Coach note</div>
                          <div className="mt-2 leading-7 text-slate-700">{activeJournalScenario.why}</div>
                        </div>
                        {journalFeedback ? (
                          <div className={`rounded-3xl p-5 ${journalFeedback.isCorrect ? "bg-emerald-50" : "bg-rose-50"}`}>
                            <div className="font-semibold text-slate-900">{journalFeedback.isCorrect ? "Balanced and correct." : "Needs correction."}</div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge variant="outline">Debits: {journalFeedback.totalDebits.toLocaleString()}</Badge>
                              <Badge variant="outline">Credits: {journalFeedback.totalCredits.toLocaleString()}</Badge>
                              <Badge variant="outline">{journalFeedback.isBalanced ? "Balanced" : "Out of balance"}</Badge>
                            </div>
                            {journalFeedback.parseErrors.length ? <div className="mt-3 text-sm leading-6 text-slate-700">Parse issues: {journalFeedback.parseErrors.join(" ")}</div> : null}
                            {journalFeedback.missingLines.length ? <div className="mt-3 text-sm leading-6 text-slate-700">Missing: {journalFeedback.missingLines.join(" | ")}</div> : null}
                            {journalFeedback.extraLines.length ? <div className="mt-3 text-sm leading-6 text-slate-700">Extra / wrong lines: {journalFeedback.extraLines.join(" | ")}</div> : null}
                            <div className="mt-3 rounded-2xl bg-white/70 p-3 text-sm leading-6 text-slate-700">Expected entry: {activeJournalScenario.expected.map(formatJournalLine).join(" ; ")}</div>
                          </div>
                        ) : (
                          <div className="rounded-3xl border border-dashed p-8 text-center text-slate-600">Check an entry to see balance, missing lines, and exact-posting feedback.</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mistakes">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle>Mistake book</CardTitle>
                      <div className="flex gap-2">
                        <Button onClick={() => launch("mistakes")} disabled={!mistakeBook.length}>Retry saved misses</Button>
                        <Button variant="outline" onClick={() => setMistakeBook([])} disabled={!mistakeBook.length}>Clear book</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loadedSessionMode === "mistakes" && sessionQuestions.length ? (
                      <>
                        <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">This run only pulls from saved misses. A correct answer clears that question out of the mistake book.</div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Run: {activeSessionLabel ?? "Mistake book"}</Badge>
                          <Badge variant="outline">Question {Math.min(questionIndex + 1, sessionQuestions.length || 1)} / {sessionQuestions.length || 0}</Badge>
                          <Badge variant="outline">Correct this run: {sessionScore}</Badge>
                          <Badge variant="outline">Saved mistakes remaining: {mistakeBook.length}</Badge>
                          <Badge variant="outline">Time: {formatDuration(liveSessionSeconds)}</Badge>
                          <Badge variant="outline">Flagged: {flaggedQuestionIds.length}</Badge>
                        </div>
                        <SessionCockpit progress={sessionProgressValue} time={formatDuration(liveSessionSeconds)} flaggedCount={flaggedQuestionIds.length} score={sessionScore} total={sessionQuestions.length} />
                        <QuestionView question={currentQuestion} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} numericInput={numericInput} setNumericInput={setNumericInput} revealed={revealed} showHint={showHint} setShowHint={setShowHint} confidence={confidence} setConfidence={setConfidence} flagged={currentQuestionFlagged} onToggleFlag={toggleCurrentQuestionFlag} onSubmit={submitQuestion} onNext={nextQuestion} />
                      </>
                    ) : prioritizedMistakes.length ? (
                      <>
                        <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">Every wrong question gets parked here locally in the browser. Use this tab as the highest-value cleanup round before another mock.</div>
                        <div className="grid gap-3">
                          {prioritizedMistakes.slice(0, 10).map((item) => (
                            <div key={item.question.id} className="rounded-3xl border p-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge>{item.question.topic}</Badge>
                                <Badge variant="outline">{item.misses} miss{item.misses === 1 ? "" : "es"}</Badge>
                              </div>
                              <div className="mt-3 font-semibold text-slate-900">{item.question.prompt}</div>
                              <div className="mt-2 text-sm leading-6 text-slate-600">{item.question.explanation}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="rounded-3xl border border-dashed p-8 text-center text-slate-600">No saved mistakes yet. Once Hanna misses a question, it will be stored here for targeted cleanup.</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mockConfidence">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader><CardTitle>{activeSessionLabel ?? "Confidence mock"}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="mb-4 rounded-3xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">This mock follows the Midterm 2 weighting but keeps the pacing gentler. Use it when the goal is stabilization, not intimidation.</div>
                    <div className="mb-4 flex flex-wrap gap-2">
                      <Badge variant="outline">Run: {activeSessionLabel ?? "Confidence mock"}</Badge>
                      <Badge variant="outline">Question {Math.min(questionIndex + 1, sessionQuestions.length || 1)} / {sessionQuestions.length || 0}</Badge>
                      <Badge variant="outline">Correct this run: {sessionScore}</Badge>
                      <Badge variant="outline">Time: {formatDuration(liveSessionSeconds)}</Badge>
                      <Badge variant="outline">Flagged: {flaggedQuestionIds.length}</Badge>
                    </div>
                    <SessionCockpit progress={sessionProgressValue} time={formatDuration(liveSessionSeconds)} flaggedCount={flaggedQuestionIds.length} score={sessionScore} total={sessionQuestions.length} />
                    <QuestionView question={currentQuestion} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} numericInput={numericInput} setNumericInput={setNumericInput} revealed={revealed} showHint={showHint} setShowHint={setShowHint} confidence={confidence} setConfidence={setConfidence} flagged={currentQuestionFlagged} onToggleFlag={toggleCurrentQuestionFlag} onSubmit={submitQuestion} onNext={nextQuestion} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mockExam">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader><CardTitle>{activeSessionLabel ?? "Exam mock"}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="mb-4 rounded-3xl bg-rose-50 p-4 text-sm leading-6 text-rose-950">This is the closest thing to the real mix: receivables, inventory, PP&E, liabilities, ratios, and a light TVM hit. Do it after one confidence pass or one weak-spots round.</div>
                    <div className="mb-4 flex flex-wrap gap-2">
                      <Badge variant="outline">Run: {activeSessionLabel ?? "Exam mock"}</Badge>
                      <Badge variant="outline">Question {Math.min(questionIndex + 1, sessionQuestions.length || 1)} / {sessionQuestions.length || 0}</Badge>
                      <Badge variant="outline">Correct this run: {sessionScore}</Badge>
                      <Badge variant="outline">Time: {formatDuration(liveSessionSeconds)}</Badge>
                      <Badge variant="outline">Flagged: {flaggedQuestionIds.length}</Badge>
                    </div>
                    <SessionCockpit progress={sessionProgressValue} time={formatDuration(liveSessionSeconds)} flaggedCount={flaggedQuestionIds.length} score={sessionScore} total={sessionQuestions.length} />
                    <QuestionView question={currentQuestion} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} numericInput={numericInput} setNumericInput={setNumericInput} revealed={revealed} showHint={showHint} setShowHint={setShowHint} confidence={confidence} setConfidence={setConfidence} flagged={currentQuestionFlagged} onToggleFlag={toggleCurrentQuestionFlag} onSubmit={submitQuestion} onNext={nextQuestion} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Card className="rounded-[2rem] shadow-lg">
          <CardHeader><CardTitle>Formula sheet and exam tactics</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[2rem] border border-white/70 bg-gradient-to-r from-amber-50 via-white to-emerald-50 p-4 shadow-sm">
              <div className="grid gap-4 lg:grid-cols-[0.82fr,1.18fr] lg:items-center">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-wide text-amber-700">Cost flow picture</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    When FIFO, LIFO, and weighted average start to blur together, use a physical shelf picture: some costs stay on the shelf and some costs move into COGS.
                  </div>
                </div>
                <StickerTile item={inventoryFlowCard} />
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="grid gap-3 md:grid-cols-2">
                {formulaSheet.map((item) => (
                  <div key={item.label} className="rounded-3xl border p-4">
                    <div className="font-semibold text-slate-900">{item.label}</div>
                    <div className="mt-2 text-slate-700">{item.formula}</div>
                  </div>
                ))}
              </div>
              <div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="1"><AccordionTrigger>Allowance questions target the ending balance</AccordionTrigger><AccordionContent>On aging problems, first compute the desired ending allowance. Then back into bad debt expense using the unadjusted allowance balance.</AccordionContent></AccordionItem>
                  <AccordionItem value="2"><AccordionTrigger>Inventory method changes the financial story</AccordionTrigger><AccordionContent>When prices are rising, FIFO usually gives higher ending inventory and lower COGS than LIFO. Know the directional effects.</AccordionContent></AccordionItem>
                  <AccordionItem value="3"><AccordionTrigger>Capitalize only future-benefit costs</AccordionTrigger><AccordionContent>Routine maintenance is expense. Improvements that extend life or increase benefit are capitalized. That distinction shows up repeatedly on this unit.</AccordionContent></AccordionItem>
                  <AccordionItem value="4"><AccordionTrigger>Accrue liabilities before cash moves</AccordionTrigger><AccordionContent>Interest payable and unearned revenue exist because the obligation exists, not because cash has just changed hands.</AccordionContent></AccordionItem>
                </Accordion>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-[1.9rem] border border-white/70 bg-white/75 px-6 py-5 text-sm text-slate-600 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold uppercase tracking-[0.18em] text-slate-500">Prepared By</div>
              <div className="mt-1 text-base font-semibold text-slate-900">Dr. Ian Helfrich</div>
            </div>
            <div className="max-w-2xl leading-6 md:text-right">
              Midterm 2 accounting practice trainer for Hanna Nio, with exam-aligned questions, recovery flow, and kawaii visual study supports.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniCaseQuestion({ item, selected, setSelected, numeric, setNumeric, revealed, setRevealed, onNext }: MiniCaseQuestionProps) {
  const isNumeric = item.type === "numeric";
  const isCorrect = isNumeric
    ? Math.abs(Number(numeric) - Number(item.answer)) < 0.01
    : String(selected).trim().toLowerCase() === String(item.answer).trim().toLowerCase();
  const caseOptions = item.options ?? [];

  return (
    <div className="space-y-4 rounded-3xl border p-5">
      <div className="text-lg font-semibold text-slate-900">{item.prompt}</div>
      {isNumeric ? (
        <div className="max-w-sm">
          <Input value={numeric} onChange={(e) => setNumeric(e.target.value)} placeholder="Enter your answer" disabled={revealed} />
        </div>
      ) : (
        <div className="grid gap-3">
          {caseOptions.map((option) => (
            <button
              key={option}
              className={`rounded-3xl border p-4 text-left transition ${selected === option ? "border-slate-900 bg-slate-100" : "border-slate-200 bg-white"}`}
              onClick={() => !revealed && setSelected(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
      {!revealed ? (
        <Button onClick={() => setRevealed(true)} disabled={isNumeric ? numeric === "" : !selected}>Check case answer</Button>
      ) : (
        <div className={`rounded-3xl p-4 ${isCorrect ? "bg-emerald-50" : "bg-rose-50"}`}>
          <div className="font-semibold text-slate-900">Correct answer: {String(item.answer)}</div>
          <div className="mt-1 leading-7 text-slate-700">{item.explanation}</div>
          <div className="mt-3">
            <Button onClick={onNext}>Next case question</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionView({ question, selectedAnswer, setSelectedAnswer, numericInput, setNumericInput, revealed, showHint, setShowHint, confidence, setConfidence, flagged, onToggleFlag, onSubmit, onNext }: QuestionViewProps) {
  if (!question) {
    return <div className="rounded-3xl border border-dashed p-8 text-center text-slate-600">No questions loaded for this mode yet. Launch a mode from the left panel.</div>;
  }

  const isAnswerBased = question.type === "mcq" || question.type === "classification";
  const isCorrect = isAnswerBased
    ? String(selectedAnswer).trim().toLowerCase() === String(question.answer).trim().toLowerCase()
    : Math.abs(Number(numericInput) - Number(question.answer)) < 0.01;

  const classificationOptions = ["Current asset", "Long-term asset", "Contra-asset", "Current liability", "Expense", "Finite-life intangible"];
  const multipleChoiceOptions = question.options ?? [];
  const questionClassificationOptions = question.options || classificationOptions;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{question.topic}</Badge>
          <Badge variant="outline">{question.type === "mcq" ? "Multiple choice" : question.type === "numeric" ? "Numeric" : "Classification"}</Badge>
          {flagged ? <Badge variant="outline">Queued for review</Badge> : null}
        </div>
        <Button variant={flagged ? "default" : "outline"} className="rounded-full" onClick={onToggleFlag}>
          <ShieldAlert className="h-4 w-4" /> {flagged ? "Flagged" : "Flag for review"}
        </Button>
      </div>
      <div className="text-xl font-semibold leading-8 text-slate-900">{question.prompt}</div>

      {question.type === "mcq" && (
        <div className="grid gap-3">
          {multipleChoiceOptions.map((option) => {
            const selectedStyle = selectedAnswer === option ? "border-slate-900 bg-slate-100" : "border-slate-200 bg-white";
            const correctStyle = revealed && option === question.answer ? "border-emerald-500 bg-emerald-50" : "";
            const wrongStyle = revealed && selectedAnswer === option && option !== question.answer ? "border-rose-500 bg-rose-50" : "";
            return (
              <button key={option} className={`rounded-3xl border p-4 text-left transition ${selectedStyle} ${correctStyle} ${wrongStyle}`} onClick={() => !revealed && setSelectedAnswer(option)}>{option}</button>
            );
          })}
        </div>
      )}

      {question.type === "classification" && (
        <div className="grid gap-3 md:grid-cols-2">
          {questionClassificationOptions.map((option) => {
            const selectedStyle = selectedAnswer === option ? "border-slate-900 bg-slate-100" : "border-slate-200 bg-white";
            const correctStyle = revealed && option === question.answer ? "border-emerald-500 bg-emerald-50" : "";
            const wrongStyle = revealed && selectedAnswer === option && option !== question.answer ? "border-rose-500 bg-rose-50" : "";
            return (
              <button key={option} className={`rounded-3xl border p-4 text-left transition ${selectedStyle} ${correctStyle} ${wrongStyle}`} onClick={() => !revealed && setSelectedAnswer(option)}>{option}</button>
            );
          })}
        </div>
      )}

      {question.type === "numeric" && (
        <div className="max-w-sm space-y-2">
          <Input value={numericInput} onChange={(e) => setNumericInput(e.target.value)} placeholder="Enter your answer" disabled={revealed} />
          <div className="text-sm text-slate-500">For percentages, enter the number only, like 12.5</div>
        </div>
      )}

      {!revealed ? (
        <div className="rounded-3xl bg-sky-50 p-4">
          <div className="text-sm font-semibold uppercase tracking-wide text-sky-700">Confidence check</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {confidenceOptions.map((option) => (
              <Button key={option} variant={confidence === option ? "default" : "outline"} className="rounded-full" onClick={() => setConfidence(option)}>
                {option}
              </Button>
            ))}
          </div>
          <div className="mt-2 text-xs leading-5 text-slate-600">This feeds the recap so Hanna can see overconfidence and shaky correct answers instead of just raw score.</div>
        </div>
      ) : null}

      {!revealed ? (
        <div className="flex flex-wrap gap-2">
          <Button onClick={onSubmit} disabled={question.type === "numeric" ? numericInput === "" || !confidence : !selectedAnswer || !confidence}>Check answer</Button>
          <Button variant="outline" onClick={() => setShowHint((x) => !x)}>{showHint ? "Hide hint" : "Show hint"}</Button>
        </div>
      ) : null}

      {!revealed && showHint ? <div className="rounded-3xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">Hint: {question.hint}</div> : null}

      {revealed ? (
        <div className="space-y-4">
          <div className={`rounded-3xl p-4 shadow-sm ${isCorrect ? "bg-emerald-50" : "bg-rose-50"}`}>
            <div className="flex items-start gap-3">
              {isCorrect ? <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600" /> : <XCircle className="mt-0.5 h-6 w-6 text-rose-600" />}
              <div>
                <div className="font-semibold text-slate-900">Correct answer: {String(question.answer)}</div>
                <div className="mt-1 leading-7 text-slate-700">{question.explanation}</div>
              </div>
            </div>
          </div>
          <Button onClick={onNext}>Next</Button>
        </div>
      ) : null}
    </div>
  );
}
