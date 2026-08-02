import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";

import { createAiProvider, getAiModelId } from "./ai-provider.server";
import { getJudge, type JudgeId, type Lang } from "./judges";

export type CourtMode = "confess" | "accuse" | "dispute" | "random";

export type CourtMessage = {
  role: "court" | "user";
  text: string;
};

export type CourtVerdict = {
  caseNumber: string;
  caseTitle: string;
  crime: string;
  evidence: string[];
  witnesses: string[];
  analysis: string;
  verdict: string;
  sentence: string;
  judgeComment: string;
  judgeSignature: string;
  judgeStamp: string;
  appealNote?: string;
  appealOutcome?: "upheld" | "reduced" | "increased" | "overturned" | "partial";
  originalSentence?: string;
  originalVerdict?: string;
};

export type CourtStep =
  | { kind: "question"; question: string; caseTitle?: string; offerParticipant?: boolean }
  | { kind: "verdict"; verdict: CourtVerdict };

export type AppealStep =
  | { kind: "question"; question: string }
  | { kind: "decision"; verdict: CourtVerdict };


const CourtInput = z.object({
  mode: z.enum(["confess", "accuse", "dispute", "random"]),
  judgeId: z.string(),
  lang: z.enum(["en", "ar"]),
  messages: z.array(
    z.object({
      role: z.enum(["court", "user"]),
      text: z.string(),
    }),
  ),
  // Set when the user explicitly chose "Continue With Current Information"
  // in Dispute mode instead of adding another participant's testimony.
  forceRuling: z.boolean().optional(),
});

const ResponseSchema = z.object({
  action: z.enum(["ask", "rule"]),
  question: z.string().nullish(),
  caseTitle: z.string().nullish(),
  // Dispute mode only: true when the "question" is an invitation to hear
  // from another, not-yet-heard participant (rendered as two buttons in the
  // UI) rather than a normal clarifying question expecting typed text.
  offerParticipant: z.boolean().nullish(),
  verdict: z
    .object({
      caseTitle: z.string(),
      crime: z.string(),
      evidence: z.array(z.string()),
      witnesses: z.array(z.string()),
      analysis: z.string(),
      verdict: z.string(),
      sentence: z.string(),
      judgeComment: z.string(),
    })
    .nullish(),
});


function modeBrief(mode: CourtMode, lang: Lang): string {
  const en: Record<CourtMode, string> = {
    confess:
      "The defendant is confessing something they personally did. Focus on honesty, intention, and regret. Minimal or zero questions.",
    accuse:
      "The plaintiff is bringing a case against another person. FIRST, if the accused has not yet spoken, invite them to defend themselves — ask ONE question phrased naturally like: 'Would the defense wish to be heard?' or 'Does the accused have anything to say?'. If the user declines or answers briefly for the accused, proceed to weigh accusation vs defense and rule.",
    dispute:
      "This is a dispute between multiple named parties. You are NOT required to hear from everyone — only ask for another participant's testimony if it would genuinely change the outcome or resolve a contradiction (see DISPUTE SMART FLOW below). Look for contradictions between statements, refer to participants by their actual names, and decide which side is more convincing.",
    random:
      "There is no real case. Invent a completely fictional, absurd, entertaining courtroom situation from thin air and rule on it immediately. Do NOT ask the user any question — proceed straight to the verdict on your fabricated case.",
  };
  const ar: Record<CourtMode, string> = {
    confess:
      "المتهم يعترف بفعلٍ قام به شخصياً. ركّز على الصدق والنية والندم. أسئلة قليلة أو معدومة.",
    accuse:
      "المدّعي يرفع قضية على شخص آخر. أولاً، إن لم يتكلّم المدّعى عليه بعد، ادعُ الدفاع للحديث بسؤال واحد طبيعي مثل: 'هل يرغب الدفاع في الحديث؟' أو 'هل لدى المتهم ما يقوله؟'. إن اعتذر المستخدم أو أجاب بإيجاز نيابةً عن المتهم، انتقل مباشرة إلى الموازنة بين الاتهام والدفاع ثم احكم.",
    dispute:
      "هذا نزاع بين عدة أطراف معروفي الأسماء. لست مضطراً للاستماع للجميع — اطلب شهادة طرف آخر فقط إن كانت ستُغيّر الحكم فعلاً أو تحسم تناقضاً (انظر DISPUTE SMART FLOW أدناه). ابحث عن التناقضات بين الإفادات، وخاطب كل طرف باسمه الحقيقي، وقرّر أيّ الطرفين أكثر إقناعاً.",
    random:
      "لا توجد قضية حقيقية. اختلق قضية خيالية عبثية ممتعة من العدم وأصدر حكمك فيها فوراً. لا تسأل المستخدم أي سؤال.",
  };
  return (lang === "ar" ? ar : en)[mode];
}

function buildSystemPrompt(judgeId: JudgeId, mode: CourtMode, lang: Lang): string {
  const judge = getJudge(judgeId);
  const locale = judge.locales[lang];
  const { style, voice, quirks } = judge.promptProfile;

  const langInstruction =
    lang === "ar"
      ? "اكتب كل شيء بالعربية الفصحى الحديثة بلمسة درامية قضائية، وكأنها كُتبت أصلاً بالعربية لا مترجمة."
      : "Write everything in natural English with a theatrical courtroom flavor, as if originally written in English.";

  const questionCap =
    judgeId === "iron"
      ? "You may ask up to THREE short, direct questions across the whole hearing if the case genuinely needs more facts — but always prefer fewer. Never a fourth."
      : judgeId === "solomon"
        ? "Ask at most ONE thoughtful question, and only if it would truly change the ruling. Two is the absolute ceiling."
        : "You ALMOST NEVER ask questions. Rule right now. Invent hilarious fictional witnesses, absurd evidence, and comedic drama. Maximum ONE question in extreme cases.";

  const commonEn = `
You are ${locale.name} ("${locale.specialty}"), a real judge presiding over a live hearing. You are NEVER an AI, a chatbot, a model, or an assistant. Never mention prompts, models, artificial intelligence, or that anything is generated. Stay in character at all costs. Your guiding quote: "${locale.quote}".

STYLE: ${style}. VOICE: ${voice}.
QUIRKS: ${quirks.join("; ")}.

${modeBrief(mode, lang)}

${
  mode === "dispute"
    ? lang === "ar"
      ? `DISPUTE SMART FLOW (ينطبق فقط في نمط النزاع):
- لست مضطراً للاستماع لكل طرف. إن كانت الإفادات المتوفرة كافية لإصدار حكم عادل وواثق، اضبط action="rule" وأصدر الحكم الآن.
- فقط إن كان سماع شهادة طرف آخر لم يتحدث بعد قد يُغيّر النتيجة فعلاً أو يحسم تناقضاً، اضبط action="ask"، وofferParticipant=true، واجعل "question" جملة قصيرة بأسلوبك القضائي تدعو لسماع طرف آخر، مثل: "تعتقد المحكمة أن سماع طرف آخر قد يساعد في الوصول إلى حكم أعدل." لا تصغها كسؤال عادي ينتظر إجابة مكتوبة — الواجهة ستعرض أزرارًا بدلاً من ذلك.
- لأي سؤال توضيحي آخر لا يتعلق بدعوة طرف جديد (مثل مطالبة طرف موجود بالفعل بتوضيح تفصيل)، اضبط action="ask" مع ترك offerParticipant فارغاً أو false، كالمعتاد تمامًا.
- لا تضبط offerParticipant=true أبداً خارج نمط النزاع.`
      : `DISPUTE SMART FLOW (only applies in Dispute mode):
- You are NOT required to hear from every participant. If the statements already given are enough to reach a fair, confident ruling, set action="rule" and deliver the verdict now.
- Only if hearing from another participant who hasn't spoken yet could genuinely change the outcome or resolve a contradiction, set action="ask", offerParticipant=true, and phrase "question" as a short in-character courtroom line inviting another statement, e.g. "The Court believes hearing another participant may help reach a fairer decision." Do NOT phrase this as a plain question expecting typed text — the interface will show buttons instead.
- For any other clarifying question that isn't about inviting a new participant (e.g. asking an existing participant to clarify a detail), set action="ask" with offerParticipant left unset/false, exactly as normal.
- Never set offerParticipant=true outside Dispute mode.`
    : ""
}

INTERNAL CLASSIFICATION (do NOT show to the user):
Silently classify the case into a category (Family, School, Friends, Work, Theft, Accident, Relationship, Funny, Property Damage, Lying, Respect, Other) and shape your question — if you ask any — around what that category actually needs. Never ask generic filler questions.

TRUST & CONTRADICTIONS:
Internally estimate your confidence (high/medium/low). If statements contradict each other or the timeline doesn't add up, say so in the analysis or verdict in courtroom language, e.g. "The Court noticed inconsistent statements" or "The timeline does not add up." Never expose raw percentages. Contradictions should push you toward a firmer or harsher ruling — for Judge Khaled especially.

DECISION RULES (CRITICAL — entertainment first):
- Users came for 30 seconds to 3 minutes of fun, NOT a long trial.
- Strongly prefer to rule immediately with ZERO questions. Only ask if a specific missing fact would genuinely change the ruling.
- ${questionCap}
- Questions MUST be extremely simple, plain-language, one short sentence — like a real judge talking to ordinary people, NOT a lawyer.
  GOOD: "What happened after that?" / "Was it intentional or an accident?" / "Who do you think was wrong?" / "Why did you do that?" / "Did the other person know?" / "How old are you?" / "Would the defense wish to be heard?"
  BAD (never use these): "Please clarify the situation." / "Restate the facts briefly." / "Provide additional context." / "Can you elaborate?" / "Tell me more." / "What else should I know?" / any question with the words "clarification", "restate", "elaborate", or "context".
- Never generic chatbot phrasing. Never say "I" as an AI. Never mention prompts, models, or AI.

CONTRADICTION HANDLING (use it, don't just detect it):
- Small contradictions (minor detail off): mention briefly in analysis, continue normally.
- Medium contradictions (details don't line up): reduce trust in that testimony and reflect it in a firmer verdict; call it out in the analysis.
- MAJOR contradictions (the story fundamentally changes — "I was alone" then "my brother saw everything"): open your analysis with a clear "⚠ Court Observation" line that quotes both statements and states the testimony's reliability has decreased. Weigh the ruling against the contradicting party — especially critical in Dispute and Accusation modes when comparing sides.


OUTPUT FORMAT: Respond with a JSON object matching the schema.

SENTENCE RULES (CRITICAL — entertainment first):
- This is a comedy app. Users should WANT to complete their sentence.
- ~80% of sentences must be VERY EASY (under 2 minutes). Examples: drink a glass of water, send a funny emoji to a friend, organize your desk for one minute, say "I admit it" out loud dramatically, compliment someone, clean your phone screen, take five deep breaths, stand up and stretch, smile for ten seconds, eat a piece of fruit.
- ~15% may be MEDIUM (5–10 minutes): a small chore, a short apology text, a tiny creative task.
- ~5% may be HARD, and ONLY when the offense is genuinely serious OR the judge is Judge Khaled facing a real wrongdoing.
- NEVER produce sentences that are dangerous, humiliating, expensive, illegal, embarrassing in public, or hard to complete.
- Sentences should feel funny, clever, and achievable — a small challenge, not a burden.

- If asking a question: action = "ask", question = your courtroom question, verdict = null. You may optionally set caseTitle if a clear title has already emerged.
- If ruling: action = "rule", question = null, verdict = full verdict object.
- The verdict object must include: caseTitle, crime (or the matter at hand), evidence (list of at least 2 short items — you may invent fictional evidence in character), witnesses (list of at least 2 short items — invent them in character if none exist), analysis (2-4 sentence court analysis in your voice, mentioning any contradictions you noticed), verdict (short ruling line), sentence (the sentence handed down, comedic but specific), judgeComment (one memorable closing line in character).
`;

  return `${commonEn}\n${langInstruction}`;
}

function transcript(messages: CourtMessage[], lang: Lang): string {
  const courtLabel = lang === "ar" ? "المحكمة" : "The Court";
  const partyLabel = lang === "ar" ? "الطرف" : "Party";
  return messages
    .map((m) => `${m.role === "court" ? courtLabel : partyLabel}: ${m.text}`)
    .join("\n");
}

function fallbackCaseNumber(): string {
  return `#${Math.floor(100000 + Math.random() * 900000)}-TC`;
}

export const courtStep = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CourtInput.parse(input))
  .handler(async ({ data }): Promise<CourtStep> => {
    const key = process.env.AI_API_KEY;
    if (!key) throw new Error("Missing AI_API_KEY");

    const provider = createAiProvider(key);
    const model = provider(getAiModelId());

    const judge = getJudge(data.judgeId);
    const locale = judge.locales[data.lang];

    const system = buildSystemPrompt(data.judgeId, data.mode as CourtMode, data.lang);
    const convo = transcript(data.messages, data.lang);
    const courtQuestionsSoFar = data.messages.filter((m) => m.role === "court").length;
    const maxQuestions =
      data.judgeId === "iron" ? 3 : data.judgeId === "solomon" ? 2 : 1;
    const mustRule = courtQuestionsSoFar >= maxQuestions;
    const forceRule = mustRule
      ? (data.lang === "ar"
          ? `\n\nتنبيه إلزامي: لقد بلغتَ الحدّ الأقصى للأسئلة (${maxQuestions}). يجب أن تصدر الحكم الآن. action = "rule".`
          : `\n\nHARD RULE: You have already asked ${courtQuestionsSoFar} question(s), which is your maximum (${maxQuestions}). You MUST rule now. Set action = "rule".`)
      : data.forceRuling
        ? (data.lang === "ar"
            ? `\n\nتنبيه: اختار المستخدم عدم إضافة شهادة إضافية والمتابعة مباشرةً نحو الحكم. أصدر حكمك الآن. action = "rule".`
            : `\n\nNOTE: The user chose not to add further testimony and wants to proceed straight to the verdict. Rule now. Set action = "rule".`)
        : "";
    const prompt =
      data.messages.length === 0 && data.mode === "random"
        ? (data.lang === "ar"
            ? "افتح جلسة اليوم بقضية خيالية جديدة تماماً وأصدر حكمك."
            : "Open today's session with a completely new fictional case and deliver your ruling.")
        : (data.lang === "ar"
            ? `محضر الجلسة حتى الآن:\n${convo}\n\nقرّر الآن: هل تسأل سؤالاً حاسماً أم تصدر الحكم؟${forceRule}`
            : `Hearing transcript so far:\n${convo}\n\nDecide now: ask one crucial question or deliver the ruling?${forceRule}`);

    let parsed: z.infer<typeof ResponseSchema> | null = null;
    let debugErr: string | undefined;
    try {
      const { output } = await generateText({
        model,
        system,
        prompt,
        output: Output.object({ schema: ResponseSchema }),
      });
      parsed = output;
    } catch (error) {
      const raw =
        NoObjectGeneratedError.isInstance(error) ? (error.text ?? "") : "";
      debugErr =
        (error instanceof Error ? error.message : String(error)) +
        (raw ? ` | raw: ${raw.slice(0, 1500)}` : "");
      console.error("[court] structured output failed", debugErr);
      if (raw) {
        try {
          const cleaned = raw
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();
          parsed = ResponseSchema.parse(JSON.parse(cleaned));
        } catch (parseErr) {
          console.error("[court] fallback parse failed", parseErr);
          parsed = null;
        }
      }
    }


    if (!parsed) {
          return {
            kind: "question",
            question:
              (data.lang === "ar" ? "ماذا حدث بعد ذلك؟" : "What happened after that?") +
              (debugErr ? `\n\n[DEBUG] ${debugErr}` : ""),
          };
        }





    if (parsed.action === "ask" && parsed.question) {
      return {
        kind: "question",
        question: parsed.question,
        caseTitle: parsed.caseTitle ?? undefined,
        offerParticipant:
          data.mode === "dispute" ? (parsed.offerParticipant ?? undefined) : undefined,
      };
    }

    if (parsed.verdict) {
      const v = parsed.verdict;
      return {
        kind: "verdict",
        verdict: {
          caseNumber: fallbackCaseNumber(),
          caseTitle: v.caseTitle,
          crime: v.crime,
          evidence: v.evidence.slice(0, 5),
          witnesses: v.witnesses.slice(0, 5),
          analysis: v.analysis,
          verdict: v.verdict,
          sentence: v.sentence,
          judgeComment: v.judgeComment,
          judgeSignature: locale.signature,
          judgeStamp: locale.officialStamp,
        },
      };
    }

    return {
      kind: "question",
      question:
        data.lang === "ar"
          ? "ماذا حدث بعد ذلك؟"
          : "What happened after that?",
    };
  });

// ============ APPEAL ============

const AppealInput = z.object({
  judgeId: z.string(),
  lang: z.enum(["en", "ar"]),
  messages: z.array(
    z.object({
      role: z.enum(["court", "user"]),
      text: z.string(),
    }),
  ),
  original: z.object({
    caseTitle: z.string(),
    crime: z.string(),
    verdict: z.string(),
    sentence: z.string(),
    judgeComment: z.string(),
  }),
  appealMessages: z
    .array(
      z.object({
        role: z.enum(["court", "user"]),
        text: z.string(),
      }),
    )
    .default([]),
});

const AppealStepSchema = z.object({
  action: z.enum(["ask", "decide"]),
  question: z.string().nullish(),
  decision: z
    .object({
      outcome: z.enum(["accepted", "partial", "rejected"]),
      newVerdict: z.string(),
      newSentence: z.string(),
      appealNote: z.string(),
      judgeComment: z.string(),
    })
    .nullish(),
});

function appealSystemPrompt(judgeId: JudgeId, lang: Lang): string {
  const base = buildSystemPrompt(judgeId, "confess", lang);
  const judgePosture: Record<string, string> = {
    iron:
      "You are Judge Iron on appeal: strict, skeptical. You rarely change your decision. Only a genuinely strong, specific explanation with new facts convinces you. Weak or emotional appeals are rejected — but you MUST explain exactly why in one sharp line.",
    solomon:
      "You are Judge Solomon on appeal: balanced and wise. You often accept reasonable explanations and frequently REDUCE punishments when the defendant shows insight, remorse or context. Reject only when the appeal has no substance.",
    jester:
      "You are Judge Jester on appeal: flexible, theatrical. You lean toward accepting appeals, often REPLACING the original sentence with a funnier, even easier one. Even when rejecting, stay humorous but never childish. Always give a real reason.",
  };

  return `${base}

APPEAL HEARING RULES (CRITICAL):
- An appeal is a short REVIEW of the original judgment, not a second trial.
- You may ask AT MOST ONE short, specific question before deciding. Two is the absolute ceiling and only if truly necessary. Prefer ZERO questions when the defendant's grounds are already clear.
- Questions must be plain, short, and courtroom-natural. Examples: "What part of the sentence do you find unfair?", "Do you have new evidence?", "Would you like to explain your actions?".
- When you decide, choose ONE outcome:
  * "accepted"  — the appeal has real merit. Either REDUCE the sentence, REPLACE it with an easier/funnier one, or ACQUIT entirely if the defense is fully convincing.
  * "partial"   — some arguments land. Make the sentence noticeably LIGHTER than the original, but not gone.
  * "rejected"  — the appeal fails. Sentence stands unchanged. You MUST explain clearly and specifically WHY, referencing what the defendant said. Never reject without a real reason.
- OUTCOME DEPENDS ON THE DEFENSE. A convincing, specific, honest explanation should genuinely increase the chance of success. A weak, whiny, or contradictory one should reduce it.
- If accepted or partial, the newSentence must still follow the SENTENCE RULES above (mostly easy, fun, safe, achievable — never dangerous, humiliating, illegal, or expensive).
- Write a fresh appealNote (why the ruling changed or stood, referencing the record) and a fresh judgeComment. Never simply repeat old wording.
- If rejected, newVerdict = original verdict and newSentence = original sentence exactly.

${judgePosture[judgeId] ?? judgePosture.solomon}

OUTPUT: JSON matching the schema.
- If asking: action="ask", question=your short courtroom question, decision=null.
- If deciding: action="decide", question=null, decision=full object.`;
}

function mapAppealOutcome(
  outcome: "accepted" | "partial" | "rejected",
  originalSentence: string,
  newSentence: string,
): "upheld" | "reduced" | "overturned" | "partial" {
  if (outcome === "rejected") return "upheld";
  if (outcome === "partial") return "partial";
  // accepted: acquittal vs reduction/replacement
  const s = newSentence.trim().toLowerCase();
  if (
    s.length < 4 ||
    /(acquit|dismiss|not guilty|no sentence|free to go|براءة|بريء|أُلغي)/i.test(
      newSentence,
    )
  ) {
    return "overturned";
  }
  if (newSentence.trim() === originalSentence.trim()) return "upheld";
  return "reduced";
}

export const courtAppeal = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AppealInput.parse(input))
  .handler(async ({ data }): Promise<AppealStep> => {
    const key = process.env.AI_API_KEY;
    if (!key) throw new Error("Missing AI_API_KEY");

    const provider = createAiProvider(key);
    const model = provider(getAiModelId());
    const judge = getJudge(data.judgeId);
    const locale = judge.locales[data.lang];

    const system = appealSystemPrompt(data.judgeId, data.lang);
    const hearing = transcript(data.messages, data.lang);
    const appealConvo =
      data.appealMessages.length > 0
        ? transcript(data.appealMessages, data.lang)
        : data.lang === "ar"
          ? "(لم يتحدث الدفاع بعد)"
          : "(defense has not yet spoken)";

    const questionsAsked = data.appealMessages.filter(
      (m) => m.role === "court",
    ).length;
    const maxQ = data.judgeId === "iron" ? 2 : 1;
    const mustDecide = questionsAsked >= maxQ;
    const force = mustDecide
      ? data.lang === "ar"
        ? `\n\nتنبيه إلزامي: بلغتَ الحدّ الأقصى للأسئلة في الاستئناف (${maxQ}). يجب أن تحسم الآن. action = "decide".`
        : `\n\nHARD RULE: You have already asked ${questionsAsked} appeal question(s), which is your maximum (${maxQ}). You MUST decide now. Set action = "decide".`
      : "";

    const prompt =
      data.lang === "ar"
        ? `السجل الأصلي للجلسة:\n${hearing}\n\nالحكم الأصلي: ${data.original.verdict}\nالعقوبة الأصلية: ${data.original.sentence}\n\nجلسة الاستئناف حتى الآن:\n${appealConvo}\n\nقرّر الآن: هل تسأل سؤالاً قصيراً أم تحسم الاستئناف؟${force}`
        : `Original hearing record:\n${hearing}\n\nOriginal verdict: ${data.original.verdict}\nOriginal sentence: ${data.original.sentence}\n\nAppeal proceeding so far:\n${appealConvo}\n\nDecide now: ask ONE short question or rule on the appeal?${force}`;

    let parsed: z.infer<typeof AppealStepSchema> | null = null;
    try {
      const { output } = await generateText({
        model,
        system,
        prompt,
        output: Output.object({ schema: AppealStepSchema }),
      });
      parsed = output;
    } catch (error) {
      const raw = NoObjectGeneratedError.isInstance(error)
        ? (error.text ?? "")
        : "";
      if (raw) {
        try {
          const cleaned = raw
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();
          parsed = AppealStepSchema.parse(JSON.parse(cleaned));
        } catch {
          parsed = null;
        }
      }
    }

    const rejectFallback = (): AppealStep => ({
      kind: "decision",
      verdict: {
        caseNumber: fallbackCaseNumber(),
        caseTitle: data.original.caseTitle,
        crime: data.original.crime,
        evidence: [],
        witnesses: [],
        analysis: "",
        verdict: data.original.verdict,
        sentence: data.original.sentence,
        judgeComment: data.original.judgeComment,
        judgeSignature: locale.signature,
        judgeStamp: locale.officialStamp,
        appealNote:
          data.lang === "ar"
            ? "تعذّر على المحكمة مراجعة الاستئناف تقنياً. الحكم قائم."
            : "The Court was unable to review the appeal at this time. The sentence stands.",
        appealOutcome: "upheld",
        originalSentence: data.original.sentence,
        originalVerdict: data.original.verdict,
      },
    });

    if (!parsed) return rejectFallback();

    if (parsed.action === "ask" && parsed.question && !mustDecide) {
      return { kind: "question", question: parsed.question };
    }

    if (parsed.decision) {
      const d = parsed.decision;
      const mapped = mapAppealOutcome(d.outcome, data.original.sentence, d.newSentence);
      const finalSentence =
        mapped === "upheld" ? data.original.sentence : d.newSentence;
      const finalVerdict =
        mapped === "upheld" ? data.original.verdict : d.newVerdict;
      return {
        kind: "decision",
        verdict: {
          caseNumber: fallbackCaseNumber(),
          caseTitle: data.original.caseTitle,
          crime: data.original.crime,
          evidence: [],
          witnesses: [],
          analysis: "",
          verdict: finalVerdict,
          sentence: finalSentence,
          judgeComment: d.judgeComment,
          judgeSignature: locale.signature,
          judgeStamp: locale.officialStamp,
          appealNote: d.appealNote,
          appealOutcome: mapped,
          originalSentence: data.original.sentence,
          originalVerdict: data.original.verdict,
        },
      };
    }

    return rejectFallback();
  });



// ============ RANDOM CASE GENERATOR ============

const RandomCaseInput = z.object({
  lang: z.enum(["en", "ar"]),
});

const RandomCaseSchema = z.object({
  text: z.string(),
});

export const generateRandomCase = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RandomCaseInput.parse(input))
  .handler(async ({ data }): Promise<{ text: string }> => {
    const key = process.env.AI_API_KEY;
    if (!key) throw new Error("Missing AI_API_KEY");
    const provider = createAiProvider(key);
    const model = provider(getAiModelId());

    // Seed randomness so every call combines different people/objects/places/actions/motivations.
    const peopleEn = ["my mother", "my father", "my little brother", "my older sister", "my cousin", "my roommate", "my best friend", "my classmate", "my neighbor", "my boss", "my grandmother", "my teacher", "my crush", "my uncle", "the barista"];
    const objectsEn = ["favorite mug", "phone charger", "leftover pizza", "birthday cake", "new hoodie", "car keys", "AirPods", "homework", "houseplant", "shampoo", "PlayStation controller", "wedding photo", "gym bag", "sourdough starter", "eyeliner"];
    const placesEn = ["in the kitchen", "at school", "at the office", "in the car", "at the mall", "at a family dinner", "in the group chat", "at the gym", "at a wedding", "in the elevator"];
    const actionsEn = ["accidentally broke", "secretly ate", "hid", "blamed someone else for losing", "borrowed without asking", "posted an embarrassing photo of", "forgot", "lied about", "spilled coffee on", "gave away", "used", "sat on"];
    const motivationsEn = ["because I panicked", "and pretended it never happened", "and blamed the cat", "out of pure boredom", "to win an argument", "because I was hungry", "just to be funny", "and lied about it for three days"];
    const peopleAr = ["أمي", "أبي", "أخي الصغير", "أختي الكبيرة", "ابن عمي", "رفيقي في السكن", "أعز أصدقائي", "زميلي في الصف", "جاري", "مديري", "جدتي", "أستاذي"];
    const objectsAr = ["كوبها المفضل", "شاحن الهاتف", "بقايا البيتزا", "كعكة عيد الميلاد", "الكنزة الجديدة", "مفاتيح السيارة", "السماعات", "الواجب المنزلي", "نبتة البيت", "الشامبو", "ذراع البلايستيشن", "حقيبة النادي"];
    const actionsAr = ["كسرت بالخطأ", "أكلت سراً", "أخفيت", "ألقيت اللوم على غيري في ضياع", "استعرت دون إذن", "نشرت صورة محرجة عن", "نسيت", "كذبت بشأن", "سكبت القهوة على", "أعطيت", "استخدمت", "جلست على"];
    const motivationsAr = ["لأنني ذُعرت", "وتظاهرت أن شيئاً لم يحدث", "وألقيت اللوم على القط", "من شدة الملل", "لأربح النقاش", "من الجوع", "لأتظاهر بالطرافة", "وكذبت ثلاثة أيام متتالية"];
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    const seed =
      data.lang === "ar"
        ? `تلميحات (للإلهام فقط، لا تنسخها حرفياً): شخص=${pick(peopleAr)}، شيء=${pick(objectsAr)}، فعل=${pick(actionsAr)}، دافع=${pick(motivationsAr)}. ابتكر جملة جديدة تماماً بروح مختلفة.`
        : `Seed hints (inspiration only, do NOT copy verbatim): person=${pick(peopleEn)}, object=${pick(objectsEn)}, place=${pick(placesEn)}, action=${pick(actionsEn)}, motivation=${pick(motivationsEn)}. Invent a completely fresh sentence with a different flavor.`;
    const nonce = Math.random().toString(36).slice(2, 8);

    const system =
      data.lang === "ar"
        ? "أنت مولّد قضايا كوميدية يومية صغيرة جداً بالعربية، بجملة واحدة قصيرة بضمير المتكلم. تنوّع الأشخاص والأشياء والأماكن والأفعال والدوافع. لا تكرر نفس الأمثلة الشائعة (طبق الأم، آخر شريحة بيتزا، عيد الميلاد المنسي) إلا نادراً. لا مقدمات، لا اقتباسات."
        : "You generate tiny funny one-sentence everyday cases in English, first person. Vary people, objects, places, actions and motivations widely. Do NOT keep reusing the same clichés (mother's plate, last slice of pizza, forgot a birthday). Aim for hundreds of possible combinations. No preamble, no quotes.";
    const prompt =
      data.lang === "ar"
        ? `اكتب قضية جديدة طريفة وأصيلة الآن، مختلفة عن أي شيء سابق. جملة واحدة فقط.\n${seed}\n(رمز التنويع: ${nonce})`
        : `Write one fresh, original, funny case now, different from anything before. One short sentence only.\n${seed}\n(variation token: ${nonce})`;

    try {
      const { output } = await generateText({
        model,
        system,
        prompt,
        output: Output.object({ schema: RandomCaseSchema }),
      });
      return { text: output.text.trim().replace(/^["'“”]+|["'“”]+$/g, "") };
    } catch {
      // Combinatorial fallback — many possibilities.
      if (data.lang === "ar") {
        return { text: `${pick(actionsAr)} ${pick(objectsAr)} الخاص بـ${pick(peopleAr)} ${pick(motivationsAr)}.` };
      }
      return {
        text: `I ${pick(actionsEn)} ${pick(peopleEn)}'s ${pick(objectsEn)} ${pick(placesEn)} ${pick(motivationsEn)}.`,
      };
    }
  });

