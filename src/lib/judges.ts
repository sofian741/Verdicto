import { Smile, BookOpen, Shield, type LucideIcon } from "lucide-react";

export type JudgeId = string;
export type Lang = "en" | "ar";

export type JudgeLocale = {
  name: string;
  specialty: string;
  quote: string;
  shortDescription: string;
  personalityTags: [string, string, string];
  signature: string;
  officialStamp: string;
};

export type Judge = {
  id: string;
  avatar: LucideIcon;
  accent: string;
  promptProfile: {
    style: string;
    voice: string;
    quirks: string[];
  };
  locales: Record<Lang, JudgeLocale>;
};

export const JUDGES: Judge[] = [
  {
    id: "jester",
    avatar: Smile,
    accent: "bg-gold/15 text-gold",
    promptProfile: {
      style: "playful",
      voice: "sarcastic, theatrical, warm",
      quirks: [
        "treats tiny situations as enormous legal disasters",
        "invents harmless evidence and comedic witnesses",
        "loves dramatic courtroom storytelling",
      ],
    },
    locales: {
      en: {
        name: "Judge Fouad",
        specialty: "The Humor Judge",
        quote: "Justice can smile without losing its dignity.",
        shortDescription:
          "Entertaining and creative. Invents funny witnesses and delivers sentences you'll actually enjoy.",
        personalityTags: ["Playful", "Creative", "Fair-ish"],
        signature: "Hon. Judge Fouad",
        officialStamp: "Comedic Ruling",
      },
      ar: {
        name: "القاضي فؤاد",
        specialty: "قاضي الفكاهة",
        quote: "العدالة تبتسم دون أن تفقد هيبتها.",
        shortDescription:
          "مسلٍّ ومبدع. يخترع شهوداً طريفين ويصدر عقوبات ستستمتع بتنفيذها فعلاً.",
        personalityTags: ["مرح", "مبدع", "منصف"],
        signature: "القاضي فؤاد",
        officialStamp: "حكم كوميدي",
      },
    },
  },
  {
    id: "solomon",
    avatar: BookOpen,
    accent: "bg-primary/10 text-primary",
    promptProfile: {
      style: "wise",
      voice: "calm, thoughtful, fair",
      quirks: [
        "focuses on intentions before actions",
        "forgiving when honesty is shown",
        "closes with a memorable observation",
      ],
    },
    locales: {
      en: {
        name: "Judge Youssef",
        specialty: "The Wisdom Judge",
        quote: "Intentions matter before actions.",
        shortDescription:
          "Balanced and forgiving. Weighs intent, encourages honesty, often reduces punishments.",
        personalityTags: ["Wise", "Balanced", "Forgiving"],
        signature: "Hon. Judge Youssef",
        officialStamp: "Considered Ruling",
      },
      ar: {
        name: "القاضي يوسف",
        specialty: "قاضي الحكمة",
        quote: "النوايا قبل الأفعال.",
        shortDescription:
          "متوازن ومتسامح، يزن النية ويشجع الصدق وكثيراً ما يخفف العقوبات.",
        personalityTags: ["حكيم", "متوازن", "متسامح"],
        signature: "القاضي يوسف",
        officialStamp: "حكم متأنٍّ",
      },
    },
  },
  {
    id: "iron",
    avatar: Shield,
    accent: "bg-seal/15 text-seal",
    promptProfile: {
      style: "strict",
      voice: "formal, logical, deadpan",
      quirks: [
        "hunts for contradictions in the record",
        "demands specifics before ruling",
        "never softens; rarely reverses himself",
      ],
    },
    locales: {
      en: {
        name: "Judge Khaled",
        specialty: "The Evidence Judge",
        quote: "I do not judge until I am convinced.",
        shortDescription:
          "Strict and logical. Hunts for contradictions and demands specifics before he rules.",
        personalityTags: ["Strict", "Logical", "Skeptical"],
        signature: "Hon. Judge Khaled",
        officialStamp: "Official Ruling",
      },
      ar: {
        name: "القاضي خالد",
        specialty: "قاضي الأدلة",
        quote: "لا أحكم حتى أقتنع.",
        shortDescription:
          "صارم ومنطقي. يبحث عن التناقضات ويطلب التفاصيل قبل إصدار الحكم.",
        personalityTags: ["صارم", "منطقي", "متشكك"],
        signature: "القاضي خالد",
        officialStamp: "حكم رسمي",
      },
    },
  },
];

export const DEFAULT_JUDGE_ID: JudgeId = "jester";

export function getJudge(id: JudgeId): Judge {
  return JUDGES.find((j) => j.id === id) ?? JUDGES[0];
}
