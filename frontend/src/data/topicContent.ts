import type { SyllabusModule, SyllabusTopic } from "@/data/syllabus";

interface TopicLesson {
  definition: string;
  example: string;
  keyPoints: string[];
  takeaway: string;
}

const moduleContexts: Record<string, { purpose: string; example: string }> = {
  "module-1": { purpose: "helps you decide whether a problem genuinely needs Big Data tools", example: "a college analysing years of attendance, LMS clicks, video usage and examination results" },
  "module-2": { purpose: "shows how storage and computation remain reliable when work is distributed", example: "processing terabytes of campus server logs across a small Hadoop cluster" },
  "module-3": { purpose: "connects flexible application data to scalable document storage", example: "storing differently shaped student activity events in one analytics collection" },
  "module-4": { purpose: "lets analysts express large transformations without writing every low-level MapReduce class", example: "grouping course activity by department using HQL or a Pig Latin pipeline" },
  "module-5": { purpose: "turns repeated, unstructured and linked data into measurable signals", example: "ranking useful course pages and mining common terms from student feedback" },
};

export function getTopicLesson(topic: SyllabusTopic, module: SyllabusModule): TopicLesson {
  const context = moduleContexts[module.id] ?? moduleContexts["module-1"];
  const action = topic.kind === "code" ? "implement" : topic.kind === "numerical" ? "calculate and compare" : topic.kind === "demo" ? "trace visually" : "explain clearly";
  return {
    definition: `${topic.summary} In this module, ${topic.title.toLowerCase()} ${context.purpose}.`,
    example: `Think about ${context.example}. This topic gives you the vocabulary and steps needed to ${action} that situation.`,
    keyPoints: [
      `Define ${topic.title} in your own words.`,
      `Connect it to the wider ${module.title} workflow.`,
      `${action.charAt(0).toUpperCase() + action.slice(1)} a small example before scaling it.`,
    ],
    takeaway: `${topic.title} is not an isolated definition—it is one decision point in the complete data journey.`,
  };
}