"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Brain, Calculator, Target, Trophy, RefreshCw, Clock3, Heart, CheckCircle2, XCircle, BookOpenText, LineChart, Sparkles, ShieldAlert, Rabbit, RotateCcw } from "lucide-react";
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
type ViewMode = "home" | "learn" | "effects" | "cases" | "tvm" | "entries" | "mistakes" | ActiveSessionMode;

type ConfidenceLevel = "Guessing" | "Pretty sure" | "Certain";

type SessionSummary = {
  mode: ActiveSessionMode;
  score: number;
  total: number;
  topic: string;
  missedTopics: string[];
  overconfidentErrors: number;
  lowConfidenceWins: number;
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
  onSubmit: () => void;
  onNext: () => void;
};

const MISTAKE_BOOK_STORAGE_KEY = "accounting_mistake_book_v1";

const confidenceOptions: ConfidenceLevel[] = ["Guessing", "Pretty sure", "Certain"];

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
  }
];

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
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [missedTopics, setMissedTopics] = useState<Record<string, number>>({});
  const [loadedSessionMode, setLoadedSessionMode] = useState<ActiveSessionMode | null>(null);
  const [loadedSessionTopic, setLoadedSessionTopic] = useState("All");
  const [lastSessionSummary, setLastSessionSummary] = useState<SessionSummary | null>(null);
  const [mistakeBook, setMistakeBook] = useState<MistakeBookItem[]>(readStoredMistakeBook);
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
  const [journalScenarioIndex, setJournalScenarioIndex] = useState(0);
  const [journalDraft, setJournalDraft] = useState("");
  const [journalFeedback, setJournalFeedback] = useState<JournalFeedback | null>(null);
  const [sessionCount, setSessionCount] = useState(0);

  const topics = ["All", ...topicRescues.map((t) => t.topic)];
  const diagnosticQuestions = useMemo(() => questionBank.filter((q) => q.family === "diagnostic"), []);
  const currentQuestion = sessionQuestions[questionIndex];
  const accuracy = attempts ? Math.round((score / attempts) * 100) : 0;
  const moodText = moods[(attempts + rescueIndex) % moods.length];
  const rankedWeakTopics = Object.entries(missedTopics).sort((a, b) => b[1] - a[1]);
  const dangerList = rankedWeakTopics.length ? rankedWeakTopics.slice(0, 3).map(([topic]) => topic) : ["No danger list yet", "Run the diagnostic", "Then recycle weak spots"];
  const rescueTopic = topicRescues[rescueIndex];
  const effect = statementEffects[effectsIndex];
  const activeCase = miniCases[caseIndex];
  const activeCaseQuestion = activeCase.questions[caseQuestionIndex];
  const activeJournalScenario = journalScenarios[journalScenarioIndex];
  const prioritizedMistakes = [...mistakeBook].sort((a, b) => {
    if (b.misses !== a.misses) return b.misses - a.misses;
    return new Date(b.lastWrongAt).getTime() - new Date(a.lastWrongAt).getTime();
  });
  const effectFields: Array<{ key: keyof StatementEffect["answer"]; label: string }> = [
    { key: "assets", label: "Assets" },
    { key: "liabilities", label: "Liabilities" },
    { key: "equity", label: "Equity" },
    { key: "netIncome", label: "Net income" },
    { key: "cash", label: "Cash" }
  ];
  const optionSet: StatementDirection[] = ["Up", "Down", "No change"];

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
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MISTAKE_BOOK_STORAGE_KEY, JSON.stringify(mistakeBook));
  }, [mistakeBook]);

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

  function launch(modeName: ActiveSessionMode, options?: { topicOverride?: string }) {
    const topicForSession = options?.topicOverride ?? selectedTopic;
    const nextSession = modeName === "diagnostic"
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
    setLoadedSessionMode(modeName);
    setLoadedSessionTopic(topicForSession);
    setSessionCount((x: number) => x + 1);
    resetQuestionState();
  }

  function nextQuestion() {
    if (questionIndex + 1 >= sessionQuestions.length) {
      if (isSessionMode(mode)) {
        const overconfidentErrors = sessionConfidenceLog.filter((item) => !item.correct && item.confidence === "Certain").length;
        const lowConfidenceWins = sessionConfidenceLog.filter((item) => item.correct && item.confidence === "Guessing").length;
        setLastSessionSummary({
          mode,
          score: sessionScore,
          total: sessionQuestions.length,
          topic: loadedSessionTopic,
          missedTopics: Object.entries(sessionMisses)
            .sort((a, b) => b[1] - a[1])
            .map(([topic]) => topic),
          overconfidentErrors,
          lowConfidenceWins
        });
      }
      if (mode === "diagnostic") setDiagnosticDone(true);
      setMode("home");
      setSessionQuestions([]);
      setQuestionIndex(0);
      setSessionScore(0);
      setSessionMisses({});
      setSessionConfidenceLog([]);
      setLoadedSessionMode(null);
      resetQuestionState();
      return;
    }
    setQuestionIndex((i: number) => i + 1);
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
    setAttempts((a: number) => a + 1);
    setSessionConfidenceLog((prev) => [...prev, { confidence, correct }]);
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
    setMode("home");
    setSessionQuestions([]);
    setQuestionIndex(0);
    setSessionScore(0);
    setSessionMisses({});
    setSessionConfidenceLog([]);
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
    setJournalScenarioIndex(0);
    setJournalDraft("");
    setJournalFeedback(null);
  }

  function handleModeChange(nextMode: string) {
    if (nextMode === "mistakes" || nextMode === "entries") {
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

  function checkJournalEntry() {
    setJournalFeedback(evaluateJournalEntry(journalDraft, activeJournalScenario));
  }

  const isRecoveryRecommended = attempts > 0 && (rankedWeakTopics.length >= 3 || accuracy < 55);
  const sessionProgressValue = sessionQuestions.length ? ((questionIndex + (revealed ? 1 : 0)) / sessionQuestions.length) * 100 : 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-rose-100 via-orange-50 to-sky-100 p-4 md:p-8">
      <div className="pointer-events-none absolute -left-16 top-20 h-56 w-56 rounded-full bg-rose-200/60 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-100/70 blur-3xl" />
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
                  <div className="rounded-[2rem] bg-gradient-to-br from-rose-50 via-white to-sky-50 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-rose-500">Mascot board</div>
                        <div className="mt-1 text-sm leading-6 text-slate-600">A lighter-hearted wrapper, but still anchored to the actual Midterm 2 topics.</div>
                      </div>
                      <Badge className="rounded-full bg-white text-slate-700 shadow-sm hover:bg-white">Study crew</Badge>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {heroStickerBoard.map((item, index) => (
                        <StickerTile key={item.src} item={item} compact priority={index < 2} />
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
                <Button className="w-full justify-start rounded-2xl py-6 text-left" variant="outline" onClick={() => launch("drill")}>
                  <Target className="mr-3 h-5 w-5" /> 3. Drill me in bursts
                </Button>
                <Button className="w-full justify-start rounded-2xl py-6 text-left" variant="outline" onClick={() => launch("weak")}>
                  <RefreshCw className="mr-3 h-5 w-5" /> 4. Recycle weak spots
                </Button>
                <Button className="w-full justify-start rounded-2xl py-6 text-left" variant="outline" onClick={() => setMode("effects")}>
                  <LineChart className="mr-3 h-5 w-5" /> 5. Statement effects lab
                </Button>
                <Button className="w-full justify-start rounded-2xl py-6 text-left" variant="outline" onClick={() => setMode("cases")}>
                  <BookOpenText className="mr-3 h-5 w-5" /> 6. Mini-case lab
                </Button>
                <Button className="w-full justify-start rounded-2xl py-6 text-left" variant="outline" onClick={() => setMode("tvm")}>
                  <Calculator className="mr-3 h-5 w-5" /> 7. TVM timeline lab
                </Button>
                <Button className="w-full justify-start rounded-2xl py-6 text-left" variant="outline" onClick={() => setMode("entries")}>
                  <BookOpenText className="mr-3 h-5 w-5" /> 8. Journal-entry workbench
                </Button>
                <Button className="w-full justify-start rounded-2xl py-6 text-left" variant="outline" onClick={() => setMode("mistakes")}>
                  <ShieldAlert className="mr-3 h-5 w-5" /> 9. Mistake book
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
              <TabsList className="grid w-full grid-cols-6 rounded-2xl lg:grid-cols-12">
                <TabsTrigger value="home">Home</TabsTrigger>
                <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
                <TabsTrigger value="learn">Learn</TabsTrigger>
                <TabsTrigger value="drill">Drill</TabsTrigger>
                <TabsTrigger value="weak">Weak</TabsTrigger>
                <TabsTrigger value="effects">Effects</TabsTrigger>
                <TabsTrigger value="cases">Cases</TabsTrigger>
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
                            <div className="mt-1 text-2xl font-black text-slate-900">{modeLabel(lastSessionSummary.mode)}: {lastSessionSummary.score}/{lastSessionSummary.total}</div>
                            <div className="mt-2 text-sm leading-6 text-slate-600">
                              Topic setting: <span className="font-semibold text-slate-800">{lastSessionSummary.topic}</span>
                              {lastSessionSummary.missedTopics.length ? ` · Focus next on ${lastSessionSummary.missedTopics.slice(0, 2).join(" and ")}.` : " · Clean run with no repeated weak spots."}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge variant="outline">Overconfident misses: {lastSessionSummary.overconfidentErrors}</Badge>
                              <Badge variant="outline">Low-confidence wins: {lastSessionSummary.lowConfidenceWins}</Badge>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button onClick={() => launch(lastSessionSummary.mode, { topicOverride: lastSessionSummary.topic })}>
                              <RefreshCw className="h-4 w-4" /> Run again
                            </Button>
                            <Button variant="outline" onClick={() => launch("weak")} disabled={!rankedWeakTopics.length}>
                              <ShieldAlert className="h-4 w-4" /> Fix misses
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    <div className="rounded-3xl bg-rose-50 p-5 leading-7">
                      This version is now anchored to the practice midterm and Classes 9-14. The sessions are built from a weighted Midterm 2 bank instead of the older generic accounting topic mix.
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
                      <CardTitle>6-question diagnostic</CardTitle>
                      <div className="w-56"><Progress value={sessionProgressValue} className="h-3" /></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex flex-wrap gap-2">
                      <Badge variant="outline">Question {Math.min(questionIndex + 1, sessionQuestions.length || 1)} / {sessionQuestions.length || 0}</Badge>
                      <Badge variant="outline">Correct this run: {sessionScore}</Badge>
                    </div>
                    <QuestionView question={currentQuestion} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} numericInput={numericInput} setNumericInput={setNumericInput} revealed={revealed} showHint={showHint} setShowHint={setShowHint} confidence={confidence} setConfidence={setConfidence} onSubmit={submitQuestion} onNext={nextQuestion} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="drill">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle>Burst drill</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        {topics.map((topic) => (
                          <Button key={topic} variant={selectedTopic === topic ? "default" : "outline"} className="rounded-full" onClick={() => chooseTopic(topic)}>{topic}</Button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">Six quick reps pulled from the dynamic Midterm 2 bank. Topic changes now relaunch the drill immediately instead of leaving you on a stale set.</div>
                    <div className="mb-4 flex flex-wrap gap-2">
                      <Badge variant="outline">Topic: {loadedSessionTopic}</Badge>
                      <Badge variant="outline">Question {Math.min(questionIndex + 1, sessionQuestions.length || 1)} / {sessionQuestions.length || 0}</Badge>
                      <Badge variant="outline">Correct this run: {sessionScore}</Badge>
                    </div>
                    <QuestionView question={currentQuestion} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} numericInput={numericInput} setNumericInput={setNumericInput} revealed={revealed} showHint={showHint} setShowHint={setShowHint} confidence={confidence} setConfidence={setConfidence} onSubmit={submitQuestion} onNext={nextQuestion} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="weak">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader><CardTitle>Weak spots recycle</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">This pulls from the topics you have missed most. Good. That means it is doing its job.</div>
                    {sessionQuestions.length ? (
                      <>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Question {Math.min(questionIndex + 1, sessionQuestions.length || 1)} / {sessionQuestions.length || 0}</Badge>
                          <Badge variant="outline">Correct this run: {sessionScore}</Badge>
                        </div>
                        <QuestionView question={currentQuestion} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} numericInput={numericInput} setNumericInput={setNumericInput} revealed={revealed} showHint={showHint} setShowHint={setShowHint} confidence={confidence} setConfidence={setConfidence} onSubmit={submitQuestion} onNext={nextQuestion} />
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
                          <Badge variant="outline">Question {Math.min(questionIndex + 1, sessionQuestions.length || 1)} / {sessionQuestions.length || 0}</Badge>
                          <Badge variant="outline">Correct this run: {sessionScore}</Badge>
                          <Badge variant="outline">Saved mistakes remaining: {mistakeBook.length}</Badge>
                        </div>
                        <QuestionView question={currentQuestion} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} numericInput={numericInput} setNumericInput={setNumericInput} revealed={revealed} showHint={showHint} setShowHint={setShowHint} confidence={confidence} setConfidence={setConfidence} onSubmit={submitQuestion} onNext={nextQuestion} />
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
                  <CardHeader><CardTitle>Confidence mock</CardTitle></CardHeader>
                  <CardContent>
                    <div className="mb-4 rounded-3xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">This mock follows the Midterm 2 weighting but keeps the pacing gentler. Use it when the goal is stabilization, not intimidation.</div>
                    <div className="mb-4 flex flex-wrap gap-2">
                      <Badge variant="outline">Question {Math.min(questionIndex + 1, sessionQuestions.length || 1)} / {sessionQuestions.length || 0}</Badge>
                      <Badge variant="outline">Correct this run: {sessionScore}</Badge>
                    </div>
                    <QuestionView question={currentQuestion} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} numericInput={numericInput} setNumericInput={setNumericInput} revealed={revealed} showHint={showHint} setShowHint={setShowHint} confidence={confidence} setConfidence={setConfidence} onSubmit={submitQuestion} onNext={nextQuestion} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mockExam">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader><CardTitle>Exam mock</CardTitle></CardHeader>
                  <CardContent>
                    <div className="mb-4 rounded-3xl bg-rose-50 p-4 text-sm leading-6 text-rose-950">This is the closest thing to the real mix: receivables, inventory, PP&E, liabilities, ratios, and a light TVM hit. Do it after one confidence pass or one weak-spots round.</div>
                    <div className="mb-4 flex flex-wrap gap-2">
                      <Badge variant="outline">Question {Math.min(questionIndex + 1, sessionQuestions.length || 1)} / {sessionQuestions.length || 0}</Badge>
                      <Badge variant="outline">Correct this run: {sessionScore}</Badge>
                    </div>
                    <QuestionView question={currentQuestion} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} numericInput={numericInput} setNumericInput={setNumericInput} revealed={revealed} showHint={showHint} setShowHint={setShowHint} confidence={confidence} setConfidence={setConfidence} onSubmit={submitQuestion} onNext={nextQuestion} />
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

function QuestionView({ question, selectedAnswer, setSelectedAnswer, numericInput, setNumericInput, revealed, showHint, setShowHint, confidence, setConfidence, onSubmit, onNext }: QuestionViewProps) {
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
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{question.topic}</Badge>
        <Badge variant="outline">{question.type === "mcq" ? "Multiple choice" : question.type === "numeric" ? "Numeric" : "Classification"}</Badge>
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
