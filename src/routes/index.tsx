import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import {
  ChevronDown,
  Download,
  Gavel,
  Languages,
  Moon,
  Scale,
  Send,
  Share2,
  Shuffle,
  Sparkles,
  Sun,
  Users,
  UserRoundSearch,
} from "lucide-react";

import { JudgeSelector } from "@/components/JudgeSelector";
import { DEFAULT_JUDGE_ID, getJudge, type JudgeId, type Lang } from "@/lib/judges";
import {
  courtAppeal,
  courtStep,
  generateRandomCase,
  type CourtMessage,
  type CourtMode,
  type CourtVerdict,
} from "@/lib/court.functions";

export const Route = createFileRoute("/")({
  component: TheCourt,
  head: () => ({
    // TODO: replace with your production domain once deployed.
    links: [{ rel: "canonical", href: "https://your-domain.com/" }],
    meta: [{ property: "og:url", content: "https://your-domain.com/" }],
  }),
});

const dict = {
  en: {
    dir: "ltr" as const,
    brand: "The Court",
    tagline: "Justice, served with a smile.",
    title: "State your case.",
    subtitle:
      "Confess, accuse, dispute, or let fate decide. Your Judge will preside over a live hearing and deliver an official verdict.",
    placeholders: {
      confess: "✍️ Write your confession here — what did you do?",
      accuse: "✍️ Write your accusation here — who did what, and to whom?",
      dispute: "✍️ Describe the dispute here — what's the disagreement about?",
      random: "No statement required. The Court will invent the case.",
    },
    examples: {
      confess: ["• I broke my mom's favorite plate.", "• I ate my roommate's leftovers at 3am."],
      accuse: ["• My brother stole my hoodie.", "• My friend never replies to my texts."],
      dispute: ["• Me and my sister fight over the remote.", "• Who forgot to take out the trash?"],
      random: [],
    },
    modes: {
      confess: "Confession",
      accuse: "Accusation",
      dispute: "Dispute",
      random: "Random Case",
    },
    submitCaseTitle: "✍️ Submit Your Case",
    universalPlaceholder:
      "Write your confession, accusation or dispute here...",
    universalExamples: [
      "• I broke my mother's plate.",
      "• My brother and I are fighting over the TV remote.",
    ],
    emptyHint: "Write your case first.",
    modesTitle: "🧩 Court Modes",
    modesSubtitle: "Choose how your case should be handled.",
    modeDescriptions: {
      confess: "Admit something you personally did. The Court will judge your actions.",
      accuse: "Bring a case against another person. The Court will hear your accusation.",
      dispute: "Present both sides of a disagreement. The Court will decide who is right.",
      random: "Let the Court invent a completely original fictional trial.",
    },

    judgeSectionTitle: "👨\u200d⚖️ Choose Your Judge",
    judgeSectionSubtitle:
      "Each judge has a unique personality, questioning style and punishment style.",
    judgeLabel: "Choose your Judge",
    generate: "Start Court",
    openHearing: "Open the Hearing",
    respond: "Address the Court",
    thinking: "The Court is deliberating...",
    entering: "The Court is now in session.",
    riseTitle: "All rise.",
    riseSubtitle: "The honorable judge is entering the courtroom.",
    court: "The Court",
    you: "You",
    verdict: {
      header: "In the High Court of Public Opinion",
      case: "Case No.",
      crime: "The Matter at Hand",
      evidence: "Evidence Presented",
      witnesses: "Witnesses",
      analysis: "Court Analysis",
      verdict: "Verdict",
      sentence: "Sentence",
      comment: "Judge's Comment",
      signed: "Signed",
    },
    appeal: "Appeal",
    share: "Share",
    another: "New Case",
    downloading: "Preparing…",
    details: "Case Details",
    hideDetails: "Hide Details",
    appealHearingTitle: "Appeal Hearing",
    appealYourReply: "Address the Court…",
    appealReviewing: "The Court is reviewing the appeal…",
    appealAlreadyDone: "This case has completed its two appeals. The judgment is now final.",
    intro:
      "Every case is judged differently depending on the mode and the judge you choose.",
    randomLoading: "The Court is drafting a case…",
    randomRegenerate: "Draw another random case",
    originalPunishment: "Original Punishment",
    newPunishment: "New Punishment",
    backToExit: "Press back again to exit.",
    // Participants (Dispute)
    addParticipantsTitle: "Add Participants",
    participantsHeader: "👥 Participants",
    participantsIntro: "Before the trial begins, the Court needs to know who is involved.",
    participantName: "Participant name",
    participantStatement: "Their version of what happened",
    beginHearing: "Begin the Hearing",
    addParticipant: "➕ Add Participant",
    maxParticipantsReached: "Maximum of 7 participants reached.",
    removeParticipant: "Remove participant",
    unnamedParticipant: "Participant",
    saveTestimony: "Save Testimony",
    testimonyRecorded: (name: string) => `✅ ${name} completed their testimony.`,
    addTestimonyOption: "📢 Add Participant Testimony",
    continueOption: "⚖️ Continue With Current Information",
    addParticipantMidHearingTitle: "Add Another Participant",
    submitTestimony: "Submit Testimony",
    cancelLabel: "Cancel",
    // Defense (Accuse)
    defenseTitle: "Does the accused want to respond?",
    defenseSubtitle: "The Court will hear both sides before ruling.",
    defenseYes: "Yes, let them speak",
    defenseNo: "No, proceed to judgment",
    defenseInputTitle: "The Accused Responds",
    defenseInputPlaceholder: "Write the accused's response here…",
    defenseSubmit: "Submit Defense",
    appealBadge: {
      upheld: "Appeal Rejected — Sentence Upheld",
      reduced: "Appeal Accepted — Sentence Reduced",
      increased: "Sentence Increased on Appeal",
      overturned: "Appeal Accepted — Defendant Acquitted",
      partial: "Appeal Partially Accepted",
    },
    footer:
      "The Court is a satire. No felines were harmed in the making of this verdict.",
    error:
      "The Court's stenographer has fainted. Please restate your case.",

  },
  ar: {
    dir: "rtl" as const,
    brand: "المحكمة",
    tagline: "العدالة تُقدَّم بابتسامة.",
    title: "قدّم قضيتك.",
    subtitle:
      "اعترف، اتّهم، نازع، أو دع القدر يقرر. سيترأس قاضيك جلسة حيّة ويصدر حكماً رسمياً.",
    placeholders: {
      confess: "✍️ اكتب اعترافك هنا — ماذا فعلت؟",
      accuse: "✍️ اكتب اتهامك هنا — من فعل ماذا، وبمن؟",
      dispute: "✍️ اكتب موضوع النزاع هنا — علام الخلاف؟",
      random: "لا حاجة لبيان. ستختلق المحكمة القضية.",
    },
    examples: {
      confess: ["• كسرت طبق أمي المفضّل.", "• أكلت طعام رفيقي في الساعة ٣ فجراً."],
      accuse: ["• أخي سرق كنزتي.", "• صديقي لا يرد على رسائلي أبداً."],
      dispute: ["• أنا وأخويا بنتخانق على الريموت.", "• من الذي نسي إخراج القمامة؟"],
      random: [],
    },
    modes: {
      confess: "اعتراف",
      accuse: "اتّهام",
      dispute: "نزاع",
      random: "قضية عشوائية",
    },
    submitCaseTitle: "✍️ قدّم قضيتك",
    universalPlaceholder: "اكتب اعترافك أو اتهامك أو نزاعك هنا...",
    universalExamples: [
      "• كسرت طبق أمي.",
      "• أنا وأخي نتشاجر على جهاز التحكم.",
    ],
    emptyHint: "اكتب قضيتك أولاً.",
    modesTitle: "🧩 أنماط المحكمة",
    modesSubtitle: "اختر كيف ستُعالَج قضيتك.",
    modeDescriptions: {
      confess: "اعترف بأمرٍ فعلتَه بنفسك، وستحكم عليك المحكمة.",
      accuse: "ارفع قضية على شخص آخر، وستستمع المحكمة إلى اتهامك.",
      dispute: "اعرض طرفَي الخلاف، وستقرّر المحكمة من على حق.",
      random: "دَع المحكمة تختلق محاكمة خيالية أصيلة تماماً.",
    },

    judgeSectionTitle: "👨\u200d⚖️ اختر قاضيك",
    judgeSectionSubtitle: "لكل قاضٍ شخصيته وأسلوب أسئلته وأسلوب عقوباته.",
    judgeLabel: "اختر قاضيك",
    generate: "ابدأ المحكمة",
    openHearing: "افتح الجلسة",
    respond: "خاطب المحكمة",
    thinking: "المحكمة تتداول...",
    entering: "الجلسة منعقدة الآن.",
    riseTitle: "قِفوا للمحكمة.",
    riseSubtitle: "القاضي الموقّر يدخل قاعة المحكمة.",
    court: "المحكمة",
    you: "أنت",
    verdict: {
      header: "في محكمة الرأي العام العليا",
      case: "رقم القضية",
      crime: "موضوع القضية",
      evidence: "الأدلة المقدّمة",
      witnesses: "الشهود",
      analysis: "تحليل المحكمة",
      verdict: "الحكم",
      sentence: "العقوبة",
      comment: "تعليق القاضي",
      signed: "التوقيع",
    },
    appeal: "استئناف",
    share: "مشاركة",
    another: "قضية جديدة",
    downloading: "جارٍ التحضير…",
    details: "تفاصيل القضية",
    hideDetails: "إخفاء التفاصيل",
    appealHearingTitle: "جلسة الاستئناف",
    appealYourReply: "خاطب المحكمة…",
    appealReviewing: "المحكمة تراجع الاستئناف…",
    appealAlreadyDone: "استُنفدت مرّتا الاستئناف. الحكم أصبح نهائياً.",
    intro: "كل قضية تُحكم بشكل مختلف حسب النمط والقاضي الذي تختاره.",
    randomLoading: "المحكمة تصيغ القضية…",
    randomRegenerate: "اسحب قضية عشوائية أخرى",
    originalPunishment: "العقوبة الأصلية",
    newPunishment: "العقوبة الجديدة",
    backToExit: "اضغط رجوع مجدداً للخروج.",
    addParticipantsTitle: "إضافة الأطراف",
    participantsHeader: "👥 الأطراف",
    participantsIntro: "قبل بدء الجلسة، تحتاج المحكمة لمعرفة الأطراف المعنيين.",
    participantName: "اسم الطرف",
    participantStatement: "روايته لما حدث",
    beginHearing: "ابدأ الجلسة",
    addParticipant: "➕ إضافة طرف",
    maxParticipantsReached: "الحد الأقصى 7 أطراف.",
    removeParticipant: "حذف الطرف",
    unnamedParticipant: "طرف",
    saveTestimony: "حفظ الشهادة",
    testimonyRecorded: (name: string) => `✅ اكتملت شهادة ${name}.`,
    addTestimonyOption: "📢 إضافة شهادة طرف آخر",
    continueOption: "⚖️ المتابعة بالمعلومات الحالية",
    addParticipantMidHearingTitle: "إضافة طرف آخر",
    submitTestimony: "إرسال الشهادة",
    cancelLabel: "إلغاء",
    defenseTitle: "هل يرغب المتهم بالرد؟",
    defenseSubtitle: "ستستمع المحكمة للطرفين قبل إصدار الحكم.",
    defenseYes: "نعم، فليتحدث",
    defenseNo: "لا، انتقل للحكم مباشرة",
    defenseInputTitle: "المتهم يرد",
    defenseInputPlaceholder: "اكتب رد المتهم هنا…",
    defenseSubmit: "قدّم الدفاع",
    appealBadge: {
      upheld: "رُفض الاستئناف — الحكم قائم",
      reduced: "قُبل الاستئناف — خُفّفت العقوبة",
      increased: "شُدّدت العقوبة بعد الاستئناف",
      overturned: "قُبل الاستئناف — بُرّئ المدعى عليه",
      partial: "قُبل الاستئناف جزئياً",
    },
    footer: "المحكمة عملٌ ساخر. لم يُؤذَ أي قط في إصدار هذا الحكم.",
    error: "أُغمي على كاتب المحكمة. أعد صياغة قضيتك.",

  },
} as const;

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const stored = localStorage.getItem("court-theme") as "light" | "dark" | null;
    const initial =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("court-theme", theme);
  }, [theme]);
  return {
    theme,
    toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
  };
}

type Phase =
  | "idle"
  | "participants"
  | "defense-choice"
  | "defense-input"
  | "rise"
  | "hearing"
  | "verdict";

type Participant = { id: string; name: string; statement: string; done: boolean };

const MAX_PARTICIPANTS = 7;

let participantSeq = 0;
function newParticipant(): Participant {
  participantSeq += 1;
  return { id: `p-${Date.now()}-${participantSeq}`, name: "", statement: "", done: false };
}

function TheCourt() {
  const [lang, setLang] = useState<Lang>("en");
  const t = dict[lang];
  const { theme, toggle } = useTheme();

  const [text, setText] = useState("");
  const [mode, setMode] = useState<CourtMode>("confess");
  const [judgeId, setJudgeId] = useState<JudgeId>(DEFAULT_JUDGE_ID);
  const [phase, setPhase] = useState<Phase>("idle");
  const historyStackRef = useRef<Phase[]>([]);
  const suppressPopRef = useRef(false);
  const [messages, setMessages] = useState<CourtMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [verdict, setVerdict] = useState<CourtVerdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [randomLoading, setRandomLoading] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null);
  const [offerParticipant, setOfferParticipant] = useState(false);
  const [addingMidHearing, setAddingMidHearing] = useState(false);
  const [midHearingName, setMidHearingName] = useState("");
  const [midHearingStatement, setMidHearingStatement] = useState("");
  const [defenseText, setDefenseText] = useState("");
  const exitPromptRef = useRef(false);

  const callCourt = useServerFn(courtStep);
  const callRandom = useServerFn(generateRandomCase);

  // --- Back-button integration -------------------------------------------
  // Every non-idle phase pushes a history entry. popstate walks us backward.
  function goTo(next: Phase) {
    if (next !== "idle") {
      historyStackRef.current.push(phase);
      if (typeof window !== "undefined") {
        window.history.pushState({ verdictoPhase: next }, "");
      }
    }
    setPhase(next);
  }

  useEffect(() => {
    function onPop() {
      if (suppressPopRef.current) {
        suppressPopRef.current = false;
        return;
      }
      const prev = historyStackRef.current.pop();
      if (prev !== undefined) {
        setPhase(prev);
      } else {
        // Already at home — arm the "press back again to exit" toast.
        if (!exitPromptRef.current) {
          exitPromptRef.current = true;
          toast(t.backToExit);
          // Re-push so the next back press actually exits.
          suppressPopRef.current = true;
          window.history.pushState({ verdictoPhase: "idle" }, "");
          setTimeout(() => {
            exitPromptRef.current = false;
          }, 2500);
        }
      }
    }
    window.addEventListener("popstate", onPop);
    // Seed one entry so the first back press is caught.
    window.history.replaceState({ verdictoPhase: "idle" }, "");
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.backToExit]);

  async function drawRandomCase() {
    setRandomLoading(true);
    try {
      const { text: t2 } = await callRandom({ data: { lang } });
      setText(t2);
    } catch (e) {
      console.error(e);
    } finally {
      setRandomLoading(false);
    }
  }

  async function selectMode(next: CourtMode) {
    setMode(next);
    if (next === "random") {
      await drawRandomCase();
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute("dir", t.dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang, t.dir]);

  async function advance(next: CourtMessage[], opts?: { forceRuling?: boolean }) {
    setPending(true);
    setError(null);
    try {
      const step = await callCourt({
        data: { mode, judgeId, lang, messages: next, forceRuling: opts?.forceRuling },
      });
      if (step.kind === "verdict") {
        setOfferParticipant(false);
        setVerdict(step.verdict);
        goTo("verdict");
      } else {
        setOfferParticipant(Boolean(step.offerParticipant));
        setMessages([...next, { role: "court", text: step.question }]);
      }
    } catch (e) {
      console.error(e);
      setError(t.error);
    } finally {
      setPending(false);
    }
  }

  async function startTrial(opening: CourtMessage[]) {
    setOfferParticipant(false);
    setMessages(opening);
    goTo("rise");
    await new Promise((r) => setTimeout(r, 1400));
    setPhase("hearing"); // replace, not push
    await advance(opening);
  }

  async function openHearing() {
    const clean = text.trim();
    // Route by mode into the right sub-flow first.
    if (mode === "dispute") {
      // Whatever was typed in the main box becomes the first participant's
      // testimony (still unnamed until they fill it in below). No participant
      // count is forced — the list starts empty otherwise.
      const initial: Participant[] =
        clean.length > 0 ? [{ ...newParticipant(), statement: clean }] : [];
      setParticipants(initial);
      setActiveParticipantId(initial[0]?.id ?? null);
      goTo("participants");
      return;
    }
    if (mode === "accuse") {
      const opening: CourtMessage[] =
        clean.length === 0 ? [] : [{ role: "user", text: clean }];
      setMessages(opening);
      goTo("defense-choice");
      return;
    }
    const opening: CourtMessage[] =
      clean.length === 0 ? [] : [{ role: "user", text: clean }];
    await startTrial(opening);
  }

  function addParticipant() {
    setParticipants((cur) => {
      if (cur.length >= MAX_PARTICIPANTS) return cur;
      const p = newParticipant();
      setActiveParticipantId(p.id);
      return [...cur, p];
    });
  }

  function removeParticipant(id: string) {
    setParticipants((cur) => cur.filter((p) => p.id !== id));
    setActiveParticipantId((cur) => (cur === id ? null : cur));
  }

  function updateParticipant(id: string, patch: Partial<Participant>) {
    setParticipants((cur) => cur.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function saveParticipantTestimony(id: string) {
    updateParticipant(id, { done: true });
    setActiveParticipantId(null);
  }

  async function submitParticipants() {
    const named = participants
      .filter((p) => p.statement.trim().length > 0)
      .map((p, i) => ({
        name: (p.name || `${lang === "ar" ? "الطرف" : "Party"} ${i + 1}`).trim(),
        statement: p.statement.trim(),
      }));
    if (named.length < 1) return;
    const compiled = named.map((p) => `${p.name}: ${p.statement}`).join("\n\n");
    await startTrial([{ role: "user", text: compiled }]);
  }

  // --- Dispute mode: "smart" mid-hearing participant flow -----------------
  function openMidHearingAdd() {
    setMidHearingName("");
    setMidHearingStatement("");
    setAddingMidHearing(true);
  }

  async function submitMidHearingParticipant() {
    const statement = midHearingStatement.trim();
    if (!statement) return;
    const name = midHearingName.trim() || (lang === "ar" ? "طرف جديد" : "New Party");
    setAddingMidHearing(false);
    setOfferParticipant(false);
    const next: CourtMessage[] = [...messages, { role: "user", text: `${name}: ${statement}` }];
    setMessages(next);
    await advance(next);
  }

  async function continueWithoutMoreTestimony() {
    setOfferParticipant(false);
    await advance(messages, { forceRuling: true });
  }

  async function submitDefense(skip: boolean) {
    if (skip) {
      await startTrial(messages);
      return;
    }
    const clean = defenseText.trim();
    if (clean.length === 0) return;
    const withDefense: CourtMessage[] = [
      ...messages,
      {
        role: "user",
        text: `${lang === "ar" ? "رد المتهم" : "The accused responds"}: ${clean}`,
      },
    ];
    await startTrial(withDefense);
  }

  async function submitReply(reply: string) {
    const clean = reply.trim();
    if (!clean || pending) return;
    setOfferParticipant(false);
    const next: CourtMessage[] = [...messages, { role: "user", text: clean }];
    setMessages(next);
    await advance(next);
  }

  function reset() {
    // Rewind browser history to home in one go.
    const depth = historyStackRef.current.length;
    historyStackRef.current = [];
    if (depth > 0 && typeof window !== "undefined") {
      suppressPopRef.current = true;
      window.history.go(-depth);
    }
    setPhase("idle");
    setText("");
    setMessages([]);
    setVerdict(null);
    setError(null);
    setDefenseText("");
    setParticipants([]);
    setActiveParticipantId(null);
    setOfferParticipant(false);
    setAddingMidHearing(false);
    setMidHearingName("");
    setMidHearingStatement("");
  }

  const modeIcon = {
    confess: Sparkles,
    accuse: UserRoundSearch,
    dispute: Users,
    random: Shuffle,
  } as const;


  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="mx-auto flex max-w-4xl items-center justify-between px-5 pt-6 sm:px-8 sm:pt-10">
        <button
          type="button"
          onClick={reset}
          aria-label="Home"
          className="flex items-center gap-2.5 rounded-full transition hover:opacity-80"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <Scale className="h-4.5 w-4.5" strokeWidth={2.25} />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">
            {t.brand}
          </span>
        </button>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setLang((l) => (l === "en" ? "ar" : "en"))}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            aria-label="Switch language"
          >
            <Languages className="h-3.5 w-3.5" />
            {lang === "en" ? "العربية" : "English"}
          </button>
          <button
            onClick={toggle}
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <motion.section
              key="idle"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="text-center">
                <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {t.tagline}
                </p>
                <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                  {t.title}
                </h1>
                <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                  {t.subtitle}
                </p>
                <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground/80">
                  {t.intro}
                </p>
              </div>

              {/* 1) Submit Your Case */}
              <div className="mt-10">
                <div className="mb-3 px-1">
                  <div className="font-display text-lg font-semibold text-foreground sm:text-xl">
                    {t.submitCaseTitle}
                  </div>
                </div>
                <div className="rounded-3xl border-2 border-border bg-card p-4 shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_60px_-28px_rgba(0,0,0,0.18)] transition focus-within:border-gold/60 focus-within:shadow-[0_0_0_4px_rgba(212,168,84,0.12),0_24px_60px_-28px_rgba(0,0,0,0.2)] sm:p-6">
                  <textarea
                    value={randomLoading ? "" : text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                      randomLoading
                        ? t.randomLoading
                        : mode === "random"
                          ? t.placeholders.random
                          : t.universalPlaceholder
                    }
                    rows={5}
                    disabled={randomLoading}
                    className="w-full resize-none rounded-2xl bg-transparent px-2 py-2 font-sans text-base leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:opacity-60 sm:text-lg"
                  />

                  {mode !== "random" && text.length === 0 && !randomLoading && (
                    <div className="px-2 pb-1 text-[13px] leading-relaxed text-muted-foreground/80">
                      {t.universalExamples.map((ex) => (
                        <p key={ex}>{ex}</p>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-border pt-4">
                    <div className="flex min-w-0 items-center gap-3">
                      {mode === "random" ? (
                        <button
                          type="button"
                          onClick={drawRandomCase}
                          disabled={randomLoading}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-gold/40 hover:text-foreground disabled:opacity-50"
                        >
                          <Shuffle className="h-3.5 w-3.5" />
                          {t.randomRegenerate}
                        </button>
                      ) : (
                        <p className="text-xs text-muted-foreground/80">
                          {text.trim().length === 0 ? t.emptyHint : "\u00a0"}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={openHearing}
                      disabled={randomLoading || text.trim().length === 0}
                      className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:text-base"
                    >
                      <Gavel className="h-4 w-4 transition group-hover:-rotate-12" />
                      {t.generate}
                    </button>
                  </div>
                </div>
              </div>

              {/* 2) Court Modes */}
              <div className="mt-10">
                <div className="mb-4 px-1">
                  <div className="font-display text-lg font-semibold text-foreground sm:text-xl">
                    {t.modesTitle}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground/80">
                    {t.modesSubtitle}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(Object.keys(t.modes) as CourtMode[]).map((m) => {
                    const Icon = modeIcon[m];
                    const active = mode === m;
                    const accent = {
                      confess: "text-amber-600 dark:text-amber-400",
                      accuse: "text-rose-600 dark:text-rose-400",
                      dispute: "text-sky-600 dark:text-sky-400",
                      random: "text-violet-600 dark:text-violet-400",
                    }[m];
                    return (
                      <button
                        key={m}
                        onClick={() => selectMode(m)}
                        aria-pressed={active}
                        title={t.modeDescriptions[m]}
                        className={`group flex flex-col items-start gap-2 rounded-2xl border p-3 text-start transition ${
                          active
                            ? "border-gold bg-card shadow-[0_0_0_1px_var(--gold)]"
                            : "border-border bg-card hover:-translate-y-0.5 hover:border-gold/40"
                        }`}
                      >
                        <div
                          className={`grid h-9 w-9 place-items-center rounded-full bg-muted ${accent}`}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2.25} />
                        </div>
                        <div className="font-display text-sm font-semibold text-foreground sm:text-base">
                          {t.modes[m]}
                        </div>
                        <p className="text-[12px] leading-snug text-muted-foreground">
                          {t.modeDescriptions[m]}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3) Choose Your Judge */}
              <div className="mt-10">
                <div className="mb-4 px-1">
                  <div className="font-display text-lg font-semibold text-foreground sm:text-xl">
                    {t.judgeSectionTitle}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground/80">
                    {t.judgeSectionSubtitle}
                  </p>
                </div>
                <JudgeSelector
                  label={t.judgeLabel}
                  value={judgeId}
                  onChange={setJudgeId}
                  lang={lang}
                />
              </div>



            </motion.section>
          )}

          {phase === "participants" && (
            <ParticipantsPanel
              key="participants"
              lang={lang}
              t={t}
              participants={participants}
              activeId={activeParticipantId}
              setActiveId={setActiveParticipantId}
              onAdd={addParticipant}
              onRemove={removeParticipant}
              onUpdate={updateParticipant}
              onSave={saveParticipantTestimony}
              onSubmit={submitParticipants}
            />
          )}

          {phase === "defense-choice" && (
            <DefenseChoice
              key="defense-choice"
              t={t}
              accusation={text}
              onYes={() => goTo("defense-input")}
              onNo={() => submitDefense(true)}
            />
          )}

          {phase === "defense-input" && (
            <DefenseInput
              key="defense-input"
              t={t}
              value={defenseText}
              onChange={setDefenseText}
              onSubmit={() => submitDefense(false)}
            />
          )}

          {phase === "rise" && <AllRise key="rise" title={t.riseTitle} subtitle={t.riseSubtitle} />}

          {phase === "hearing" && (
            <HearingRoom
              key="hearing"
              messages={messages}
              pending={pending}
              error={error}
              labels={{
                court: t.court,
                you: t.you,
                thinking: t.thinking,
                respond: t.respond,
                entering: t.entering,
              }}
              onSubmit={submitReply}
              dispute={
                mode === "dispute"
                  ? {
                      show: offerParticipant,
                      adding: addingMidHearing,
                      onAdd: openMidHearingAdd,
                      onContinue: continueWithoutMoreTestimony,
                      addLabels: {
                        addOption: t.addTestimonyOption,
                        continueOption: t.continueOption,
                      },
                      name: midHearingName,
                      statement: midHearingStatement,
                      onNameChange: setMidHearingName,
                      onStatementChange: setMidHearingStatement,
                      onSubmit: submitMidHearingParticipant,
                      onCancel: () => setAddingMidHearing(false),
                      formLabels: {
                        title: t.addParticipantMidHearingTitle,
                        namePlaceholder: t.participantName,
                        statementPlaceholder: t.participantStatement,
                        submit: t.submitTestimony,
                        cancel: t.cancelLabel,
                      },
                    }
                  : undefined
              }
            />
          )}

          {phase === "verdict" && verdict && (
            <VerdictCard
              key="verdict"
              lang={lang}
              t={t}
              judgeId={judgeId}
              messages={messages}
              verdict={verdict}
              setVerdict={setVerdict}
              onNew={reset}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="mx-auto max-w-3xl px-5 pb-10 text-center text-xs text-muted-foreground sm:px-8">
        {t.footer}
      </footer>
    </div>
  );
}

function AllRise({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-[60vh] flex-col items-center justify-center text-center"
    >
      <motion.div
        animate={{ rotate: [0, -22, 12, -14, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl"
      >
        <Gavel className="h-9 w-9" />
      </motion.div>
      <h2 className="mt-8 font-display text-3xl font-semibold tracking-tight">
        {title}
      </h2>
      <p className="mt-3 text-sm uppercase tracking-[0.2em] text-muted-foreground">
        {subtitle}
      </p>
    </motion.div>
  );
}

type DisputeHearingExtras = {
  show: boolean;
  adding: boolean;
  onAdd: () => void;
  onContinue: () => void;
  addLabels: { addOption: string; continueOption: string };
  name: string;
  statement: string;
  onNameChange: (v: string) => void;
  onStatementChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  formLabels: {
    title: string;
    namePlaceholder: string;
    statementPlaceholder: string;
    submit: string;
    cancel: string;
  };
};

function HearingRoom({
  messages,
  pending,
  error,
  labels,
  onSubmit,
  dispute,
}: {
  messages: CourtMessage[];
  pending: boolean;
  error: string | null;
  labels: {
    court: string;
    you: string;
    thinking: string;
    respond: string;
    entering: string;
  };
  onSubmit: (text: string) => void;
  dispute?: DisputeHearingExtras;
}) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pending]);

  useEffect(() => {
    if (!pending) inputRef.current?.focus();
  }, [pending]);

  const lastIsCourt = messages[messages.length - 1]?.role === "court";
  const canReply = lastIsCourt && !pending;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="mb-4 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
        {labels.entering}
      </div>

      <div
        ref={scrollRef}
        className="max-h-[60vh] overflow-y-auto rounded-3xl border border-border bg-card p-4 shadow-[0_1px_0_rgba(0,0,0,0.02),0_20px_50px_-30px_rgba(0,0,0,0.15)] sm:p-6"
      >
        <div className="space-y-5">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={m.role === "court" ? "" : "flex justify-end"}
              >
                {m.role === "court" ? (
                  <div className="max-w-[92%]">
                    <div className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                      <Gavel className="h-3 w-3" />
                      {labels.court}
                    </div>
                    <p className="font-display text-lg leading-relaxed text-foreground sm:text-xl">
                      {m.text}
                    </p>
                  </div>
                ) : (
                  <div className="max-w-[85%] rounded-2xl bg-muted px-4 py-3">
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {labels.you}
                    </div>
                    <p className="text-[15px] leading-relaxed text-foreground">
                      {m.text}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {pending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-sm text-muted-foreground"
            >
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold" />
              </span>
              <span className="italic">{labels.thinking}</span>
            </motion.div>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-4 text-center text-sm text-seal">{error}</p>
      )}

      {dispute?.adding ? (
        <div className="mt-4 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {dispute.formLabels.title}
          </p>
          <input
            value={dispute.name}
            onChange={(e) => dispute.onNameChange(e.target.value)}
            placeholder={dispute.formLabels.namePlaceholder}
            className="w-full rounded-lg bg-transparent px-2 py-1.5 font-display text-base font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <textarea
            value={dispute.statement}
            onChange={(e) => dispute.onStatementChange(e.target.value)}
            placeholder={dispute.formLabels.statementPlaceholder}
            rows={3}
            className="mt-1 w-full resize-none rounded-lg bg-transparent px-2 py-1.5 font-sans text-base leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={dispute.onCancel}
              disabled={pending}
              className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-50"
            >
              {dispute.formLabels.cancel}
            </button>
            <button
              type="button"
              onClick={dispute.onSubmit}
              disabled={pending || dispute.statement.trim().length === 0}
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {dispute.formLabels.submit}
            </button>
          </div>
        </div>
      ) : dispute?.show ? (
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={dispute.onAdd}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-gold/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {dispute.addLabels.addOption}
          </button>
          <button
            type="button"
            onClick={dispute.onContinue}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {dispute.addLabels.continueOption}
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-3xl border border-border bg-card p-3 shadow-[0_1px_0_rgba(0,0,0,0.02),0_10px_30px_-20px_rgba(0,0,0,0.15)] sm:p-4">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canReply && draft.trim()) {
                    onSubmit(draft);
                    setDraft("");
                  }
                }
              }}
              placeholder={labels.respond}
              rows={2}
              disabled={!canReply}
              className="flex-1 resize-none rounded-2xl bg-transparent px-3 py-2 font-sans text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:opacity-50 sm:text-base"
            />
            <button
              onClick={() => {
                if (canReply && draft.trim()) {
                  onSubmit(draft);
                  setDraft("");
                }
              }}
              disabled={!canReply || !draft.trim()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </motion.section>
  );
}

type Dict = (typeof dict)[Lang];

function VerdictCard({
  lang,
  t,
  judgeId,
  messages,
  verdict,
  setVerdict,
  onNew,
}: {
  lang: Lang;
  t: Dict;
  judgeId: JudgeId;
  messages: CourtMessage[];
  verdict: CourtVerdict;
  setVerdict: (v: CourtVerdict) => void;
  onNew: () => void;
}) {
  const labels = t.verdict;
  const [expanded, setExpanded] = useState(false);
  const [showAppeal, setShowAppeal] = useState(false);
  const [appealMessages, setAppealMessages] = useState<CourtMessage[]>([]);
  const [appealDraft, setAppealDraft] = useState("");
  const [appealing, setAppealing] = useState(false);
  const [appealsUsed, setAppealsUsed] = useState(0);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  const callAppeal = useServerFn(courtAppeal);
  const judge = getJudge(judgeId);
  const JudgeIcon = judge.avatar;
  const MAX_APPEALS = 2;
  const appealDone = appealsUsed >= MAX_APPEALS;

  async function runAppeal(nextAppeal: CourtMessage[]) {
    setAppealing(true);
    try {
      const step = await callAppeal({
        data: {
          judgeId,
          lang,
          messages,
          original: {
            caseTitle: verdict.caseTitle,
            crime: verdict.crime,
            verdict: verdict.verdict,
            sentence: verdict.sentence,
            judgeComment: verdict.judgeComment,
          },
          appealMessages: nextAppeal,
        },
      });
      if (step.kind === "question") {
        setAppealMessages([...nextAppeal, { role: "court", text: step.question }]);
      } else {
        setVerdict(step.verdict);
        setAppealMessages([]);
        setAppealDraft("");
        setShowAppeal(false);
        setAppealsUsed((n) => n + 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAppealing(false);
    }
  }

  async function openAppeal() {
    if (appealDone || appealing) return;
    setShowAppeal(true);
    if (appealMessages.length === 0) {
      await runAppeal([]);
    }
  }

  async function submitAppealReply() {
    const clean = appealDraft.trim();
    if (!clean || appealing) return;
    const next: CourtMessage[] = [
      ...appealMessages,
      { role: "user", text: clean },
    ];
    setAppealMessages(next);
    setAppealDraft("");
    await runAppeal(next);
  }


  async function handleShare() {
    if (sharing || !shareRef.current) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(shareRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#faf5ea",
      });
      const link = document.createElement("a");
      link.download = `the-court-${verdict.caseNumber.replace(/[^\w-]/g, "")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setSharing(false);
    }
  }

  const appealBadge = verdict.appealOutcome
    ? t.appealBadge[verdict.appealOutcome]
    : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-3xl border border-border bg-parchment p-6 shadow-[0_1px_0_rgba(0,0,0,0.02),0_30px_80px_-40px_rgba(0,0,0,0.25)] sm:p-10"
      >
        {/* Status header */}
        <div className="flex flex-col items-center gap-3 border-b border-dashed border-border pb-6 text-center">
          <div className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-gold text-gold">
            <Scale className="h-5 w-5" />
          </div>
          <p className="font-display text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            {labels.header}
          </p>
          {appealBadge && (
            <span className="rounded-full bg-seal/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-seal">
              {appealBadge}
            </span>
          )}
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {verdict.caseTitle}
          </h2>
        </div>

        {/* SENTENCE — the hero */}
        <div className="mt-8 text-center">
          <p className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
            <Gavel className="h-3.5 w-3.5" />
            {labels.sentence}
          </p>
          {verdict.originalSentence &&
          verdict.originalSentence.trim() !== verdict.sentence.trim() ? (
            <div className="flex flex-col items-center gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {t.originalPunishment}
                </p>
                <p className="mt-1 font-display text-xl leading-snug text-muted-foreground/80 line-through decoration-seal/60 sm:text-2xl">
                  {verdict.originalSentence}
                </p>
              </div>
              <div className="text-2xl text-gold">↓</div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold">
                  {t.newPunishment}
                </p>
                <p className="mt-1 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
                  {verdict.sentence}
                </p>
              </div>
            </div>
          ) : (
            <p className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
              {verdict.sentence}
            </p>
          )}
          <p className="mt-4 font-display text-lg italic text-muted-foreground sm:text-xl">
            {verdict.verdict}
          </p>
        </div>


        {/* Judge comment */}
        <div className="mt-8 rounded-2xl border border-border bg-card/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <JudgeIcon className="h-3.5 w-3.5" />
            {verdict.judgeSignature}
          </div>
          <p className="font-display text-lg italic leading-relaxed text-ink sm:text-xl">
            &ldquo;{verdict.judgeComment}&rdquo;
          </p>
          {verdict.appealNote && (
            <div className="mt-4 border-t border-dashed border-border pt-4 text-sm leading-relaxed text-muted-foreground">
              <span className="me-2 font-semibold uppercase tracking-[0.18em] text-seal">
                ⚖
              </span>
              {verdict.appealNote}
            </div>
          )}
        </div>

        {/* Signature + Stamp */}
        <div className="mt-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {labels.signed}
            </p>
            <p className="mt-1 font-display text-xl italic text-ink">
              {verdict.judgeSignature}
            </p>
          </div>
          <div className="stamp text-[10px] sm:text-xs">{verdict.judgeStamp}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        <button
          onClick={openAppeal}
          disabled={appealing || appealDone || showAppeal}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Scale className="h-4 w-4" />
          {t.appeal}
        </button>
        <button
          onClick={handleShare}
          disabled={sharing}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {sharing ? <Download className="h-4 w-4 animate-pulse" /> : <Share2 className="h-4 w-4" />}
          {sharing ? t.downloading : t.share}
        </button>
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          <Sparkles className="h-4 w-4" />
          {t.another}
        </button>
      </div>

      {appealDone && (
        <p className="mt-3 text-center text-xs italic text-muted-foreground">
          {t.appealAlreadyDone}
        </p>
      )}

      {/* Appeal hearing */}
      <AnimatePresence>
        {showAppeal && !appealDone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 overflow-hidden"
          >
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold">
                <Scale className="h-3.5 w-3.5" />
                {t.appealHearingTitle}
              </div>

              <div className="max-h-[40vh] space-y-4 overflow-y-auto">
                {appealMessages.map((m, i) => (
                  <div
                    key={i}
                    className={m.role === "court" ? "" : "flex justify-end"}
                  >
                    {m.role === "court" ? (
                      <div className="max-w-[92%]">
                        <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                          <Gavel className="h-3 w-3" />
                          {t.court}
                        </div>
                        <p className="font-display text-base leading-relaxed text-ink sm:text-lg">
                          {m.text}
                        </p>
                      </div>
                    ) : (
                      <div className="max-w-[85%] rounded-2xl bg-muted px-3 py-2">
                        <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          {t.you}
                        </div>
                        <p className="text-sm leading-relaxed text-foreground">
                          {m.text}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {appealing && (
                  <div className="flex items-center gap-2 text-xs italic text-muted-foreground">
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold" />
                    </span>
                    {t.appealReviewing}
                  </div>
                )}
              </div>

              {appealMessages[appealMessages.length - 1]?.role === "court" &&
                !appealing && (
                  <div className="mt-4 flex items-end gap-2 border-t border-dashed border-border pt-4">
                    <textarea
                      value={appealDraft}
                      onChange={(e) => setAppealDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          submitAppealReply();
                        }
                      }}
                      placeholder={t.appealYourReply}
                      rows={2}
                      className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      onClick={submitAppealReply}
                      disabled={!appealDraft.trim()}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Send"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Expandable details */}
      <div className="mt-6">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mx-auto flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? t.hideDetails : t.details}
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <dl className="mt-4 space-y-5 rounded-2xl border border-border bg-card p-5 text-[14px] leading-relaxed text-foreground sm:text-[15px]">
                <Field label={labels.case}>{verdict.caseNumber}</Field>
                <Field label={labels.crime}>{verdict.crime}</Field>
                {verdict.evidence.length > 0 && (
                  <Field label={labels.evidence}>
                    <ul className="ms-5 list-disc space-y-1.5 marker:text-gold">
                      {verdict.evidence.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </Field>
                )}
                {verdict.witnesses.length > 0 && (
                  <Field label={labels.witnesses}>
                    <div className="flex flex-wrap gap-2">
                      {verdict.witnesses.map((w, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-border bg-background px-3 py-1 text-sm"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </Field>
                )}
                {verdict.analysis && (
                  <Field label={labels.analysis}>{verdict.analysis}</Field>
                )}
              </dl>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden share image (rendered off-screen for html-to-image) */}
      <div className="pointer-events-none fixed -left-[9999px] top-0" aria-hidden>
        <div
          ref={shareRef}
          dir={t.dir}
          style={{
            width: 1080,
            padding: 64,
            background:
              "linear-gradient(180deg, #faf5ea 0%, #f3ead6 100%)",
            color: "#1a1712",
            fontFamily: "'Fraunces', 'Noto Kufi Arabic', serif",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                fontSize: 22,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#6b5b3a",
              }}
            >
              ⚖ {t.brand}
            </div>
          </div>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div
              style={{
                fontSize: 18,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "#8a7a5c",
                marginBottom: 12,
              }}
            >
              {labels.header}
            </div>
            <div style={{ fontSize: 56, fontWeight: 600, lineHeight: 1.1 }}>
              {verdict.caseTitle}
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              borderTop: "1px dashed #c9b98a",
              borderBottom: "1px dashed #c9b98a",
              margin: "32px 0",
            }}
          >
            <div
              style={{
                fontSize: 16,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#a8892d",
                marginBottom: 20,
              }}
            >
              ⚖ {labels.sentence}
            </div>
            <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05 }}>
              {verdict.sentence}
            </div>
          </div>
          <div
            style={{
              fontSize: 28,
              fontStyle: "italic",
              lineHeight: 1.4,
              textAlign: "center",
              color: "#3a2f1e",
              margin: "0 40px",
            }}
          >
            &ldquo;{verdict.judgeComment}&rdquo;
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: 60,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "#8a7a5c",
                }}
              >
                {labels.signed}
              </div>
              <div style={{ fontSize: 32, fontStyle: "italic", marginTop: 6 }}>
                {verdict.judgeSignature}
              </div>
              <div style={{ fontSize: 14, color: "#8a7a5c", marginTop: 4 }}>
                {labels.case} {verdict.caseNumber}
              </div>
            </div>
            <div
              style={{
                border: "3px double #a8892d",
                color: "#a8892d",
                padding: "12px 20px",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                transform: "rotate(-6deg)",
                borderRadius: 8,
              }}
            >
              {verdict.judgeStamp}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

type DictT = (typeof dict)[Lang];

function ParticipantsPanel({
  lang,
  t,
  participants,
  activeId,
  setActiveId,
  onAdd,
  onRemove,
  onUpdate,
  onSave,
  onSubmit,
}: {
  lang: Lang;
  t: DictT;
  participants: Participant[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Participant>) => void;
  onSave: (id: string) => void;
  onSubmit: () => void;
}) {
  const canSubmit = participants.some((p) => p.statement.trim().length > 0);
  const atMax = participants.length >= MAX_PARTICIPANTS;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {t.addParticipantsTitle}
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.participantsHeader}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          {t.participantsIntro}
        </p>
      </div>

      <div className="mt-8 space-y-3">
        {participants.map((p, i) => {
          const trimmedName = p.name.trim();
          const displayName = trimmedName || `${t.unnamedParticipant} ${i + 1}`;
          const isActive = activeId === p.id;
          const isDone = p.done && p.statement.trim().length > 0;
          return (
            <div key={p.id} className="rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => setActiveId(isActive ? null : p.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-start"
                >
                  <span className="truncate font-display text-base font-semibold text-foreground sm:text-lg">
                    {displayName}
                  </span>
                  {isDone && (
                    <span className="shrink-0 text-xs text-emerald-600 dark:text-emerald-400">
                      ✅
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(p.id)}
                  aria-label={t.removeParticipant}
                  className="shrink-0 rounded-full p-2 text-muted-foreground transition hover:text-seal"
                >
                  🗑️
                </button>
              </div>

              {isDone && !isActive && (
                <p className="px-4 pb-3 text-xs text-emerald-600 dark:text-emerald-400 sm:px-5">
                  {t.testimonyRecorded(displayName)}
                </p>
              )}

              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden border-t border-dashed border-border px-4 pb-4 sm:px-5 sm:pb-5"
                  >
                    <input
                      value={p.name}
                      onChange={(e) => onUpdate(p.id, { name: e.target.value })}
                      placeholder={t.participantName}
                      className="mt-4 w-full rounded-lg bg-transparent px-2 py-1.5 font-display text-base font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {trimmedName
                        ? lang === "ar"
                          ? `أقوال ${trimmedName}`
                          : `${trimmedName}'s Statement`
                        : t.participantStatement}
                    </p>
                    <textarea
                      value={p.statement}
                      onChange={(e) => onUpdate(p.id, { statement: e.target.value, done: false })}
                      placeholder={t.participantStatement}
                      rows={3}
                      className="mt-1 w-full resize-none rounded-lg bg-transparent px-2 py-1.5 font-sans text-base leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onSave(p.id)}
                        disabled={p.statement.trim().length === 0}
                        className="rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold text-foreground transition hover:border-gold/40 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {t.saveTestimony}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onAdd}
          disabled={atMax}
          className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-gold/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t.addParticipant}
        </button>
        {atMax && <p className="text-xs text-muted-foreground">{t.maxParticipantsReached}</p>}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:text-base"
        >
          <Gavel className="h-4 w-4" />
          {t.beginHearing}
        </button>
      </div>
    </motion.section>
  );
}

function DefenseChoice({
  t,
  accusation,
  onYes,
  onNo,
}: {
  t: DictT;
  accusation: string;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="text-center"
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {t.modes.accuse}
      </p>
      <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {t.defenseTitle}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
        {t.defenseSubtitle}
      </p>
      {accusation.trim().length > 0 && (
        <blockquote className="mx-auto mt-6 max-w-xl rounded-2xl border border-border bg-card px-5 py-4 text-start text-sm italic text-foreground/90 shadow-sm">
          “{accusation.trim()}”
        </blockquote>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={onYes}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 transition hover:-translate-y-0.5 hover:shadow-xl sm:text-base"
        >
          {t.defenseYes}
        </button>
        <button
          onClick={onNo}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition hover:border-gold/40 sm:text-base"
        >
          {t.defenseNo}
        </button>
      </div>
    </motion.section>
  );
}

function DefenseInput({
  t,
  value,
  onChange,
  onSubmit,
}: {
  t: DictT;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {t.modes.accuse}
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.defenseInputTitle}
        </h2>
      </div>
      <div className="mt-6 rounded-3xl border-2 border-border bg-card p-4 shadow-sm sm:p-6">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.defenseInputPlaceholder}
          rows={5}
          className="w-full resize-none rounded-2xl bg-transparent px-2 py-2 font-sans text-base leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none sm:text-lg"
        />
        <div className="mt-4 flex justify-end border-t border-dashed border-border pt-4">
          <button
            onClick={onSubmit}
            disabled={value.trim().length === 0}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:text-base"
          >
            <Gavel className="h-4 w-4" />
            {t.defenseSubmit}
          </button>
        </div>
      </div>
    </motion.section>
  );
}


