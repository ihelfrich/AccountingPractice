"use client";

import type { BankQuestion } from "./midterm2TestBank";

export type CoachConfidence = "Guessing" | "Pretty sure" | "Certain";

export type CoachQuestionRecord = {
  question: BankQuestion;
  correct: boolean;
  confidence: CoachConfidence;
  flagged: boolean;
  secondsSpent: number;
};

export type CoachHistorySignal = {
  topic: string;
  accuracy: number;
  missedTopics: string[];
};

export type ConceptLesson = {
  id: string;
  topic: string;
  title: string;
  importance: number;
  keywords: string[];
  whyItMatters: string;
  teach: string;
  examMoves: string[];
  trap: string;
  retrievalPrompt: string;
  retrievalAnswer: string;
  recommendedTool: "drill" | "entries" | "simulators" | "effects" | "tvm" | "learn";
};

export type ConceptPriority = {
  lesson: ConceptLesson;
  score: number;
  status: "Urgent" | "Active" | "Reinforce" | "Stable";
  whyNow: string;
  matchedQuestions: BankQuestion[];
  signals: {
    mistakeCount: number;
    latestWrong: number;
    flagged: number;
    overconfidentErrors: number;
    latestCorrect: number;
  };
};

export type CoachHistoryEntry = {
  createdAt: string;
  priorities: Array<{
    id: string;
    title: string;
    topic: string;
    score: number;
    status: ConceptPriority["status"];
  }>;
};

const conceptCatalog: ConceptLesson[] = [
  {
    id: "allowance-target-balance",
    topic: "Receivables & Allowance",
    title: "Target the ending allowance first",
    importance: 10,
    keywords: ["aging", "desired ending allowance", "allowance", "bad debt expense", "unadjusted allowance"],
    whyItMatters: "Allowance questions are high-yield because one clean setup usually unlocks the whole problem.",
    teach: "On an aging problem, do not start with expense. First compute the desired ending Allowance for Doubtful Accounts. Then compare that target with the current unadjusted balance to get the adjusting entry amount.",
    examMoves: [
      "Write desired ending allowance first.",
      "Note whether the current allowance is a credit or debit.",
      "Bad debt expense is the amount needed to land on the target balance."
    ],
    trap: "Students often plug the aging result directly into bad debt expense, which is only right if the unadjusted allowance is zero.",
    retrievalPrompt: "If desired ending allowance is 9,800 and the allowance already has a 1,700 credit balance, what is bad debt expense?",
    retrievalAnswer: "8,100. The company needs 8,100 more credit in the allowance to end at 9,800.",
    recommendedTool: "drill"
  },
  {
    id: "writeoff-does-not-create-expense",
    topic: "Receivables & Allowance",
    title: "A write-off uses the allowance, not new expense",
    importance: 8,
    keywords: ["write off", "uncollectible", "specific customer", "allowance method", "net accounts receivable"],
    whyItMatters: "This concept shows up in multiple-choice and protects against one of the fastest avoidable mistakes on the exam.",
    teach: "When a specific account is written off under the allowance method, debit the allowance and credit accounts receivable. Net accounts receivable usually stays the same because both gross receivables and the allowance fall together.",
    examMoves: [
      "Remove the customer balance from accounts receivable.",
      "Use the existing allowance balance, not bad debt expense.",
      "Think in net A/R, not just gross A/R."
    ],
    trap: "If you record bad debt expense again on the write-off date, you are double-counting the loss.",
    retrievalPrompt: "What happens to net accounts receivable when a specific customer is written off under the allowance method?",
    retrievalAnswer: "Usually no change. Gross receivables and the allowance decrease by the same amount.",
    recommendedTool: "entries"
  },
  {
    id: "inventory-method-direction",
    topic: "Inventory",
    title: "Know the FIFO/LIFO story when prices are rising",
    importance: 10,
    keywords: ["fifo", "lifo", "rising", "ending inventory", "net income", "cost flow"],
    whyItMatters: "Inventory direction questions are common because they test whether you understand the story behind the numbers, not just the arithmetic.",
    teach: "When purchase costs are rising, FIFO leaves newer, more expensive units in ending inventory, so ending inventory tends to be higher and COGS lower than under LIFO. Lower COGS usually means higher gross profit and higher net income.",
    examMoves: [
      "Ask whether prices are rising or falling.",
      "Decide which costs stay on the shelf versus move to COGS.",
      "Translate the cost-flow result into income direction."
    ],
    trap: "Students memorize one directional fact and then forget to connect it to COGS, gross profit, and ending inventory together.",
    retrievalPrompt: "In a rising-price environment, which method usually gives the highest ending inventory?",
    retrievalAnswer: "FIFO, because the newest higher-cost units remain in ending inventory.",
    recommendedTool: "simulators"
  },
  {
    id: "inventory-build-cogs",
    topic: "Inventory",
    title: "Build inventory problems from goods available",
    importance: 9,
    keywords: ["goods available", "cogs", "weighted-average", "ending inventory", "periodic"],
    whyItMatters: "When students panic on inventory questions, it is usually because they skip the goods-available structure and start guessing.",
    teach: "Inventory problems become manageable when you anchor everything to goods available for sale. Then use the method to determine ending inventory, and back into COGS as goods available minus ending inventory.",
    examMoves: [
      "Compute goods available units and cost first.",
      "Use the method to value ending inventory.",
      "Only then compute COGS."
    ],
    trap: "Trying to jump directly to COGS without a goods-available setup leads to scrambled units and costs.",
    retrievalPrompt: "If goods available for sale is 12,000 and ending inventory is 3,500, what is COGS?",
    retrievalAnswer: "8,500. Cost of goods sold equals goods available minus ending inventory.",
    recommendedTool: "simulators"
  },
  {
    id: "capitalize-vs-expense",
    topic: "PP&E + Intangibles",
    title: "Capitalize only costs that prepare the asset for use",
    importance: 10,
    keywords: ["capitalized", "expensed", "freight", "installation", "training", "repair", "future benefit"],
    whyItMatters: "This distinction is one of the central ideas in the PP&E unit and drives both conceptual and journal-entry questions.",
    teach: "Capitalize costs that acquire the asset and get it ready for use, like purchase price, freight, and installation. Expense costs that do not create future service potential, such as training and routine maintenance.",
    examMoves: [
      "Ask whether the cost gets the asset ready for use.",
      "If yes, capitalize into the asset account.",
      "If it is training or routine maintenance, expense it."
    ],
    trap: "Students often overcapitalize because they confuse 'paid near the purchase date' with 'belongs in the asset.'",
    retrievalPrompt: "Should training paid for a new machine usually be capitalized or expensed?",
    retrievalAnswer: "Expensed. Training does not become part of the asset's cost.",
    recommendedTool: "entries"
  },
  {
    id: "depreciation-book-value-disposal",
    topic: "PP&E + Intangibles",
    title: "Always go through book value before disposal gain or loss",
    importance: 10,
    keywords: ["book value", "accumulated depreciation", "sale", "disposal", "gain", "loss", "straight-line depreciation"],
    whyItMatters: "Disposal questions are a favorite exam move because they combine depreciation, book value, and gain/loss logic in one place.",
    teach: "Compute book value as cost minus accumulated depreciation. Then compare the sale proceeds with book value: proceeds above book value create a gain, below book value create a loss. Remove both the asset and accumulated depreciation from the books.",
    examMoves: [
      "Find cost and accumulated depreciation.",
      "Book value equals cost minus accumulated depreciation.",
      "Compare cash received with book value to determine gain or loss."
    ],
    trap: "Students often compare sale proceeds with original cost instead of book value.",
    retrievalPrompt: "Equipment cost 66,000, accumulated depreciation 48,000, and sells for 20,000. Gain or loss?",
    retrievalAnswer: "Gain of 2,000. Book value is 18,000, so proceeds exceed book value by 2,000.",
    recommendedTool: "simulators"
  },
  {
    id: "estimate-changes-are-prospective",
    topic: "PP&E + Intangibles",
    title: "Estimate changes affect future depreciation only",
    importance: 7,
    keywords: ["change in estimate", "revised salvage", "remaining life", "prospective"],
    whyItMatters: "Estimate-change questions punish memorized formulas unless the student really understands what is being recomputed.",
    teach: "When useful life or salvage value changes, do not restate prior depreciation. Start with current book value, subtract revised salvage, and spread the remaining depreciable base over the revised remaining life.",
    examMoves: [
      "Stop at current book value.",
      "Use revised salvage and revised remaining life.",
      "Treat the change prospectively only."
    ],
    trap: "The classic error is recalculating depreciation from original cost as if the old years never happened.",
    retrievalPrompt: "What is the starting point for depreciation after a change in estimate: original cost or current book value?",
    retrievalAnswer: "Current book value.",
    recommendedTool: "simulators"
  },
  {
    id: "accrue-interest-and-unearned",
    topic: "Current Liabilities",
    title: "Accrue liabilities before cash moves again",
    importance: 9,
    keywords: ["interest payable", "unearned revenue", "accrued expense", "accrue", "recognize earned revenue", "interest expense"],
    whyItMatters: "These are pure timing questions. Once the timing logic is stable, both entries and classification questions become much easier.",
    teach: "Liabilities exist because the obligation exists, not because cash has just moved. Accrue interest as time passes. For cash collected in advance, start with a liability and convert the earned portion into revenue over time.",
    examMoves: [
      "For notes, principal × rate × time gives accrued interest.",
      "For advance cash, move the earned portion out of unearned revenue.",
      "Ask what has been earned or incurred by the balance-sheet date."
    ],
    trap: "Students wait for the cash payment date and miss the accrual at year-end.",
    retrievalPrompt: "A 24,000 note at 12% has been outstanding for 4 months. How much interest is accrued?",
    retrievalAnswer: "960. Use 24,000 × 12% × 4/12.",
    recommendedTool: "entries"
  },
  {
    id: "current-vs-quick-story",
    topic: "Ratios & Turnover",
    title: "Separate liquidity ratios from inventory-heavy illusions",
    importance: 8,
    keywords: ["current ratio", "quick ratio", "liquidity", "inventory", "interpretation"],
    whyItMatters: "Ratio questions are often verbal traps. The student needs to understand what the ratio says, not just how to calculate it.",
    teach: "The current ratio includes inventory and other current assets. The quick ratio strips out less-liquid current assets and asks how much near-cash coverage exists for current liabilities. A wide gap between the two often means inventory is carrying much of the current ratio.",
    examMoves: [
      "Current ratio uses all current assets.",
      "Quick ratio excludes inventory.",
      "Interpret the gap between them, not just the raw values."
    ],
    trap: "A high current ratio is not automatically strong liquidity if the quick ratio is weak.",
    retrievalPrompt: "If the current ratio is 2.4 and the quick ratio is 0.9, what does that usually suggest?",
    retrievalAnswer: "Much of the current ratio is being supported by inventory rather than quick assets.",
    recommendedTool: "drill"
  },
  {
    id: "turnover-and-days-sales",
    topic: "Ratios & Turnover",
    title: "Turn turnover ratios into business meaning",
    importance: 8,
    keywords: ["turnover", "days' sales", "receivables turnover", "ppe turnover", "collection", "signals"],
    whyItMatters: "These questions become easy points once the student can translate a ratio into an operational story.",
    teach: "Higher receivables turnover generally means faster collection, while higher days' sales in receivables means slower collection. PPE turnover speaks to how efficiently fixed assets generate revenue. Always interpret direction in plain language.",
    examMoves: [
      "Higher turnover usually means faster movement or collection.",
      "Days' sales moves in the opposite direction: higher days means slower collection.",
      "Describe the business signal, not just the number."
    ],
    trap: "Students calculate correctly and then reverse the interpretation.",
    retrievalPrompt: "If accounts receivable turnover rises, does collection look faster or slower?",
    retrievalAnswer: "Faster.",
    recommendedTool: "drill"
  },
  {
    id: "discounting-direction",
    topic: "TVM Basics",
    title: "Discounting means moving a future amount back to today",
    importance: 6,
    keywords: ["present value", "future value", "discount", "today", "sooner", "later"],
    whyItMatters: "TVM is lighter on this exam, but it is still easy to lose points by confusing the direction of time.",
    teach: "At a positive discount rate, money received later is worth less today. Discounting moves a future cash flow back to present value. Compounding moves today’s amount forward to future value.",
    examMoves: [
      "Draw the timeline first.",
      "If the cash is in the future and you want today's value, discount.",
      "If the cash starts today and you want the future amount, compound."
    ],
    trap: "The common mistake is using the right formula in the wrong time direction.",
    retrievalPrompt: "At a positive rate, is the present value of 1,000 received in three years above or below 1,000?",
    retrievalAnswer: "Below 1,000.",
    recommendedTool: "tvm"
  }
];

function normalize(text: string) {
  return text.toLowerCase();
}

function questionText(question: BankQuestion) {
  return normalize(`${question.prompt} ${question.explanation} ${question.hint ?? ""}`);
}

function lessonMatchesQuestion(lesson: ConceptLesson, question: BankQuestion) {
  if (question.topic !== lesson.topic) return false;
  const text = questionText(question);
  return lesson.keywords.some((keyword) => text.includes(keyword));
}

export function getConceptLessons() {
  return conceptCatalog;
}

export function getConceptReviewPack(lessonId: string, questions: BankQuestion[]) {
  const lesson = conceptCatalog.find((item) => item.id === lessonId);
  if (!lesson) return [];
  return questions.filter((question) => question.family !== "diagnostic" && lessonMatchesQuestion(lesson, question)).slice(0, 8);
}

export function buildConceptPriorities({
  questions,
  mistakeBook,
  missedTopics,
  latestRecords,
  sessionHistory
}: {
  questions: BankQuestion[];
  mistakeBook: Array<{ question: BankQuestion; misses: number }>;
  missedTopics: Record<string, number>;
  latestRecords: CoachQuestionRecord[];
  sessionHistory: CoachHistorySignal[];
}) {
  return conceptCatalog
    .map((lesson) => {
      let score = lesson.importance * 3;
      let mistakeCount = 0;
      let latestWrong = 0;
      let flagged = 0;
      let overconfidentErrors = 0;
      let latestCorrect = 0;
      const matchedQuestions = questions.filter((question) => lessonMatchesQuestion(lesson, question));

      score += (missedTopics[lesson.topic] || 0) * 1.6;

      mistakeBook.forEach((item) => {
        if (!lessonMatchesQuestion(lesson, item.question)) return;
        mistakeCount += item.misses;
        score += item.misses * 4.5;
      });

      latestRecords.forEach((record) => {
        if (!lessonMatchesQuestion(lesson, record.question)) return;
        if (record.correct) {
          latestCorrect += 1;
          score -= record.confidence === "Certain" && !record.flagged ? 2.5 : 1.2;
        } else {
          latestWrong += 1;
          score += 5;
        }
        if (record.flagged) {
          flagged += 1;
          score += 2;
        }
        if (!record.correct && record.confidence === "Certain") {
          overconfidentErrors += 1;
          score += 3;
        }
        if (record.secondsSpent >= 75) {
          score += 0.8;
        }
      });

      sessionHistory.slice(0, 8).forEach((entry, index) => {
        const recencyWeight = Math.max(0.6, 1 - index * 0.08);
        if (entry.topic === lesson.topic && entry.accuracy >= 80) score -= 1.3 * recencyWeight;
        if (entry.topic === lesson.topic && entry.accuracy < 65) score += 2.2 * recencyWeight;
        if (entry.missedTopics.includes(lesson.topic)) score += 1.5 * recencyWeight;
      });

      const status: ConceptPriority["status"] = score >= 34
        ? "Urgent"
        : score >= 25
          ? "Active"
          : score >= 17
            ? "Reinforce"
            : "Stable";

      const whyNow = overconfidentErrors > 0
        ? "This is dangerous because Hanna has recently missed it while feeling certain."
        : mistakeCount > 0
          ? "This keeps returning in the mistake book, so it is still costing repeat points."
          : latestWrong > 0
            ? "This showed up as a fresh miss on the latest run."
            : flagged > 0
              ? "Hanna flagged this concept for another pass even when it did not fully break."
              : `This is a high-value ${lesson.topic.toLowerCase()} idea that still needs reinforcement before the exam mix feels automatic.`;

      return {
        lesson,
        score: Math.round(score * 10) / 10,
        status,
        whyNow,
        matchedQuestions,
        signals: {
          mistakeCount,
          latestWrong,
          flagged,
          overconfidentErrors,
          latestCorrect
        }
      } satisfies ConceptPriority;
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.lesson.importance - a.lesson.importance;
    });
}

export function buildCoachHistoryEntry(priorities: ConceptPriority[]): CoachHistoryEntry {
  return {
    createdAt: new Date().toISOString(),
    priorities: priorities.slice(0, 6).map((item) => ({
      id: item.lesson.id,
      title: item.lesson.title,
      topic: item.lesson.topic,
      score: item.score,
      status: item.status
    }))
  };
}
