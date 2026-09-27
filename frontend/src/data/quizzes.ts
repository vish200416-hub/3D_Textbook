export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  revisionTopic: string;
}

export interface ModuleQuiz {
  moduleId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export const moduleQuizzes: ModuleQuiz[] = [
  {
    moduleId: "module-1",
    title: "Big Data Foundations Check",
    description: "Check your understanding of the 5Vs, analytics types and the shift beyond traditional BI.",
    questions: [
      { id: "m1q1", prompt: "Which Big Data characteristic describes how quickly data arrives and must be processed?", options: ["Volume", "Velocity", "Variety", "Veracity"], answer: 1, explanation: "Velocity measures the speed of data generation, movement and processing.", revisionTopic: "5Vs of Big Data" },
      { id: "m1q2", prompt: "Which analytics type recommends the best action to take?", options: ["Descriptive", "Diagnostic", "Predictive", "Prescriptive"], answer: 3, explanation: "Prescriptive analytics goes beyond forecasting and recommends an action or decision.", revisionTopic: "Classification of Analytics" },
      { id: "m1q3", prompt: "Why is Hadoop commonly chosen for very large raw datasets?", options: ["It requires one powerful server", "It distributes storage and processing", "It only accepts structured tables", "It removes the need for analytics"], answer: 1, explanation: "Hadoop scales horizontally by distributing data and computation across commodity machines.", revisionTopic: "Warehouse vs Hadoop" },
    ],
  },
  {
    moduleId: "module-2",
    title: "Hadoop & MapReduce Check",
    description: "Test HDFS roles, block replication and the MapReduce execution pipeline.",
    questions: [
      { id: "m2q1", prompt: "What is the primary responsibility of the NameNode?", options: ["Store every data block", "Manage metadata and namespace", "Execute SQL queries", "Compress client files"], answer: 1, explanation: "The NameNode maintains the filesystem namespace and maps blocks to DataNodes; DataNodes hold the actual blocks.", revisionTopic: "HDFS NameNode" },
      { id: "m2q2", prompt: "A file has 6 blocks and replication factor 3. How many physical block copies are stored?", options: ["6", "9", "18", "24"], answer: 2, explanation: "Physical copies = logical blocks × replication factor = 6 × 3 = 18.", revisionTopic: "HDFS Block Replication" },
      { id: "m2q3", prompt: "Which MapReduce stage groups all values belonging to the same key?", options: ["Input split", "Shuffle and sort", "Mapper setup", "HDFS heartbeat"], answer: 1, explanation: "Shuffle and sort transfers and groups intermediate key-value pairs before reducers process them.", revisionTopic: "Shuffle and Sort" },
    ],
  },
  {
    moduleId: "module-3",
    title: "MongoDB Check",
    description: "Review documents, collections, flexible schemas and aggregation operations.",
    questions: [
      { id: "m3q1", prompt: "What is the MongoDB equivalent of a relational table?", options: ["Document", "Collection", "Field", "Pipeline"], answer: 1, explanation: "A collection groups related documents, much like a relational table groups rows.", revisionTopic: "MongoDB Terminology" },
      { id: "m3q2", prompt: "Which MongoDB feature processes documents through ordered transformation stages?", options: ["Aggregation pipeline", "Foreign key", "Stored page", "Tuple lock"], answer: 0, explanation: "An aggregation pipeline passes documents through stages such as match, group, project and sort.", revisionTopic: "MongoDB Aggregation" },
      { id: "m3q3", prompt: "Why can a document model be useful for evolving application data?", options: ["Every document must be identical", "Nested related fields can stay together", "It prevents horizontal scaling", "It supports numbers only"], answer: 1, explanation: "Documents can contain nested structures and evolve without requiring every record to share a rigid row layout.", revisionTopic: "Document Model" },
    ],
  },
  {
    moduleId: "module-4",
    title: "Hive & Pig Check",
    description: "Distinguish HQL, Pig Latin, storage formats and high-level dataflows.",
    questions: [
      { id: "m4q1", prompt: "Which language provides an SQL-like interface over Hadoop data?", options: ["Pig Latin", "HQL", "BSON", "YARN"], answer: 1, explanation: "Hive Query Language (HQL) gives analysts a familiar SQL-like way to describe distributed queries.", revisionTopic: "Hive Query Language" },
      { id: "m4q2", prompt: "A Pig Latin script is best described as what?", options: ["A procedural dataflow", "A filesystem namespace", "A document index", "A cluster heartbeat"], answer: 0, explanation: "Pig Latin expresses a sequence of transformations such as load, filter, group, join and store.", revisionTopic: "Pig Latin" },
      { id: "m4q3", prompt: "Why can a column-oriented format reduce analytical scan work?", options: ["It always duplicates every row", "It reads only needed columns", "It removes all schemas", "It disables compression"], answer: 1, explanation: "Column-oriented storage can skip unrelated columns, reducing I/O for analytical queries.", revisionTopic: "Hive File Formats" },
    ],
  },
  {
    moduleId: "module-5",
    title: "Spark & Web Analytics Check",
    description: "Assess Spark workflows, text mining and PageRank on linked web data.",
    questions: [
      { id: "m5q1", prompt: "Why can Spark be faster for iterative analytics?", options: ["It keeps reusable data in memory", "It avoids all transformations", "It uses one CPU only", "It stores no data"], answer: 0, explanation: "Spark can cache reusable datasets in memory, avoiding repeated disk reads between iterative stages.", revisionTopic: "Spark Data Analysis" },
      { id: "m5q2", prompt: "In a web graph, what does a directed edge usually represent?", options: ["A page color", "A hyperlink", "A database row", "A text token"], answer: 1, explanation: "Pages are vertices and hyperlinks form directed edges from one page to another.", revisionTopic: "Web Graph Structure" },
      { id: "m5q3", prompt: "What does PageRank estimate?", options: ["File compression ratio", "Importance from link structure", "MongoDB document size", "HDFS block count"], answer: 1, explanation: "PageRank repeatedly distributes importance through incoming and outgoing links until scores approach convergence.", revisionTopic: "PageRank" },
    ],
  },
];

export function getModuleQuiz(moduleId: string | undefined) {
  return moduleQuizzes.find((quiz) => quiz.moduleId === moduleId) ?? moduleQuizzes[0];
}