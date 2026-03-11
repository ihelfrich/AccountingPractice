"use client";

import React, { useMemo, useState } from "react";
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

type StatementGuess = Record<keyof StatementEffect["answer"], StatementDirection | "">;

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
  onSubmit: () => void;
  onNext: () => void;
};

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: LucideIcon }) {
  return (
    <div className="rounded-3xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
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

export default function USCAccountingPracticeTool() {
  const [mode, setMode] = useState("home");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [sessionQuestions, setSessionQuestions] = useState<BankQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [numericInput, setNumericInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [diagnosticDone, setDiagnosticDone] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [missedTopics, setMissedTopics] = useState<Record<string, number>>({});
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
  const [timelineFV, setTimelineFV] = useState("1100");
  const [timelineR, setTimelineR] = useState("10");
  const [timelineN, setTimelineN] = useState("1");
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
    setRevealed(false);
    setShowHint(false);
  }

  function launch(modeName: string) {
    const nextSession = modeName === "diagnostic" ? diagnosticQuestions : buildSession(modeName, selectedTopic, missedTopics, sessionCount + 1);
    setMode(modeName);
    setSessionQuestions(nextSession);
    setQuestionIndex(0);
    setSessionCount((x: number) => x + 1);
    resetQuestionState();
  }

  function nextQuestion() {
    if (questionIndex + 1 >= sessionQuestions.length) {
      if (mode === "diagnostic") setDiagnosticDone(true);
      setMode("home");
      setSessionQuestions([]);
      setQuestionIndex(0);
      resetQuestionState();
      return;
    }
    setQuestionIndex((i: number) => i + 1);
    resetQuestionState();
  }

  function submitQuestion() {
    if (!currentQuestion || revealed) return;
    let correct = false;
    if (currentQuestion.type === "mcq" || currentQuestion.type === "classification") {
      correct = String(selectedAnswer).trim().toLowerCase() === String(currentQuestion.answer).trim().toLowerCase();
    } else {
      correct = Math.abs(Number(numericInput) - Number(currentQuestion.answer)) < 0.01;
    }
    setAttempts((a: number) => a + 1);
    if (correct) {
      setScore((s: number) => s + 1);
      setStreak((s: number) => s + 1);
    } else {
      setStreak(0);
      setMissedTopics((prev) => ({ ...prev, [currentQuestion.topic]: (prev[currentQuestion.topic] || 0) + 1 }));
    }
    setRevealed(true);
  }

  function resetAll() {
    setMode("home");
    setSessionQuestions([]);
    setQuestionIndex(0);
    setSelectedAnswer("");
    setNumericInput("");
    setRevealed(false);
    setShowHint(false);
    setDiagnosticDone(false);
    setScore(0);
    setAttempts(0);
    setStreak(0);
    setMissedTopics({});
    setSessionCount(0);
    setRescueIndex(0);
    setRescueFill("");
    setRescueReveal(false);
  }

  const isRecoveryRecommended = attempts > 0 && (rankedWeakTopics.length >= 3 || accuracy < 55);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-emerald-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <Card className="rounded-[2rem] border-0 shadow-xl">
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
                  <MascotBubble mascot="Chococat" text="This version is built to look like the practice midterm, not a generic accounting quiz." />
                  <MascotBubble mascot="Keroppi" text="Run the diagnostic, fix the worst topic, then use the exam-weighted mocks." />
                  <div className="rounded-3xl bg-slate-100 p-4 text-sm text-slate-700 shadow-sm">
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
              </CardContent>
            </Card>
          </div>

          <div>
            <Tabs value={mode} onValueChange={setMode} className="space-y-4">
              <TabsList className="grid w-full grid-cols-5 rounded-2xl lg:grid-cols-10">
                <TabsTrigger value="home">Home</TabsTrigger>
                <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
                <TabsTrigger value="learn">Learn</TabsTrigger>
                <TabsTrigger value="drill">Drill</TabsTrigger>
                <TabsTrigger value="weak">Weak</TabsTrigger>
                <TabsTrigger value="effects">Effects</TabsTrigger>
                <TabsTrigger value="cases">Cases</TabsTrigger>
                <TabsTrigger value="tvm">TVM</TabsTrigger>
                <TabsTrigger value="mockConfidence">Conf</TabsTrigger>
                <TabsTrigger value="mockExam">Exam</TabsTrigger>
              </TabsList>

              <TabsContent value="home">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader><CardTitle>What this bank now covers</CardTitle></CardHeader>
                  <CardContent className="space-y-4 text-slate-700">
                    <div className="rounded-3xl bg-rose-50 p-5 leading-7">
                      This version is now anchored to the practice midterm and Classes 9-14. The sessions are built from a weighted Midterm 2 bank instead of the older generic accounting topic mix.
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
                      <div className="w-56"><Progress value={sessionQuestions.length ? ((questionIndex + (revealed ? 1 : 0)) / sessionQuestions.length) * 100 : 0} className="h-3" /></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <QuestionView question={currentQuestion} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} numericInput={numericInput} setNumericInput={setNumericInput} revealed={revealed} showHint={showHint} setShowHint={setShowHint} onSubmit={submitQuestion} onNext={nextQuestion} />
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
                          <Button key={topic} variant={selectedTopic === topic ? "default" : "outline"} className="rounded-full" onClick={() => { setSelectedTopic(topic); }}>{topic}</Button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">Six quick reps pulled from the dynamic Midterm 2 bank. If you switch the topic filter, relaunch Drill from the left panel.</div>
                    <QuestionView question={currentQuestion} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} numericInput={numericInput} setNumericInput={setNumericInput} revealed={revealed} showHint={showHint} setShowHint={setShowHint} onSubmit={submitQuestion} onNext={nextQuestion} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="weak">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader><CardTitle>Weak spots recycle</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">This pulls from the topics you have missed most. Good. That means it is doing its job.</div>
                    {sessionQuestions.length ? (
                      <QuestionView question={currentQuestion} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} numericInput={numericInput} setNumericInput={setNumericInput} revealed={revealed} showHint={showHint} setShowHint={setShowHint} onSubmit={submitQuestion} onNext={nextQuestion} />
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
                        <Button variant="outline" onClick={() => { setCaseIndex((i) => (i - 1 + miniCases.length) % miniCases.length); setCaseQuestionIndex(0); setCaseSelected(""); setCaseNumeric(""); setCaseRevealed(false); setCaseScore(0); }}>Previous case</Button>
                        <Button onClick={() => { setCaseIndex((i) => (i + 1) % miniCases.length); setCaseQuestionIndex(0); setCaseSelected(""); setCaseNumeric(""); setCaseRevealed(false); setCaseScore(0); }}>Next case</Button>
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
                        if (correct) setCaseScore((s) => s + 1);
                        if (caseQuestionIndex + 1 < activeCase.questions.length) {
                          setCaseQuestionIndex((i) => i + 1);
                          setCaseSelected("");
                          setCaseNumeric("");
                          setCaseRevealed(false);
                        } else {
                          setCaseQuestionIndex(0);
                          setCaseSelected("");
                          setCaseNumeric("");
                          setCaseRevealed(false);
                        }
                      }}
                    />
                    <div className="rounded-3xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">Case score this run: {caseScore}</div>
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

              <TabsContent value="mockConfidence">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader><CardTitle>Confidence mock</CardTitle></CardHeader>
                  <CardContent>
                    <div className="mb-4 rounded-3xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">This mock follows the Midterm 2 weighting but keeps the pacing gentler. Use it when the goal is stabilization, not intimidation.</div>
                    <QuestionView question={currentQuestion} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} numericInput={numericInput} setNumericInput={setNumericInput} revealed={revealed} showHint={showHint} setShowHint={setShowHint} onSubmit={submitQuestion} onNext={nextQuestion} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mockExam">
                <Card className="rounded-[2rem] shadow-lg">
                  <CardHeader><CardTitle>Exam mock</CardTitle></CardHeader>
                  <CardContent>
                    <div className="mb-4 rounded-3xl bg-rose-50 p-4 text-sm leading-6 text-rose-950">This is the closest thing to the real mix: receivables, inventory, PP&E, liabilities, ratios, and a light TVM hit. Do it after one confidence pass or one weak-spots round.</div>
                    <QuestionView question={currentQuestion} selectedAnswer={selectedAnswer} setSelectedAnswer={setSelectedAnswer} numericInput={numericInput} setNumericInput={setNumericInput} revealed={revealed} showHint={showHint} setShowHint={setShowHint} onSubmit={submitQuestion} onNext={nextQuestion} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Card className="rounded-[2rem] shadow-lg">
          <CardHeader><CardTitle>Formula sheet and exam tactics</CardTitle></CardHeader>
          <CardContent>
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

function QuestionView({ question, selectedAnswer, setSelectedAnswer, numericInput, setNumericInput, revealed, showHint, setShowHint, onSubmit, onNext }: QuestionViewProps) {
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
        <div className="flex flex-wrap gap-2">
          <Button onClick={onSubmit} disabled={question.type === "numeric" ? numericInput === "" : !selectedAnswer}>Check answer</Button>
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
