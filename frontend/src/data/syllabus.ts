export type TopicKind = "concept" | "demo" | "numerical" | "code";

export interface SyllabusTopic {
  id: string;
  title: string;
  summary: string;
  kind: TopicKind;
}

export interface SyllabusModule {
  id: string;
  code: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  accent: string;
  topics: SyllabusTopic[];
  practicals: string[];
  numericals: string[];
  snippets: string[];
}

export const syllabusSubject = {
  id: "big-data-analytics",
  name: "Big Data Analytics",
  code: "BAD601 / BCS714D",
  description:
    "A visual-first study path through the VTU syllabus — from the 5Vs and distributed storage to MapReduce, MongoDB, Hive, Pig, Spark and web analytics.",
  totalProgress: 28,
  nextModule: "Hadoop Architecture & MapReduce",
};

export const syllabusModules: SyllabusModule[] = [
  {
    id: "module-1",
    code: "MODULE 01",
    title: "Big Data Foundations & Analytics Frameworks",
    description:
      "Build the mental model for big data: its classification, evolution, analytics lifecycle and ecosystem of tools.",
    duration: "3 h 40 min",
    progress: 64,
    accent: "#22d3ee",
    topics: [
      { id: "data-classification", title: "Classification of data", summary: "Structured, semi-structured and unstructured data in modern systems.", kind: "concept" },
      { id: "big-data-characteristics", title: "Characteristics and evolution of Big Data", summary: "The 5Vs, scale, speed and the shift from traditional data platforms.", kind: "concept" },
      { id: "why-big-data", title: "What is Big Data and why it matters", summary: "Recognise the business and engineering problems that create big data.", kind: "concept" },
      { id: "bi-vs-big-data", title: "Traditional BI vs Big Data", summary: "Compare warehouse-first reporting with distributed analytics environments.", kind: "numerical" },
      { id: "warehouse-hadoop", title: "Data warehouse and Hadoop environments", summary: "See how a typical warehouse and Hadoop environment fit into an analytics stack.", kind: "demo" },
      { id: "big-data-analytics", title: "Big Data Analytics", summary: "Define analytics and connect descriptive, predictive and prescriptive thinking.", kind: "concept" },
      { id: "analytics-classification", title: "Classification of Analytics", summary: "Map a question to descriptive, diagnostic, predictive or prescriptive analytics.", kind: "concept" },
      { id: "analytics-tools", title: "Analytics technologies and tools", summary: "Survey NoSQL, Hadoop and the tools used in big data environments.", kind: "code" },
    ],
    practicals: ["Choose the right analytics type for a real-world case study", "Sketch a warehouse-to-Hadoop data flow"],
    numericals: ["Calculate volume growth across a multi-year dataset", "Classify sample datasets by structure and analytics type"],
    snippets: ["A 5Vs dataset classifier", "Analytics lifecycle pseudocode", "Tool selection decision guide"],
  },
  {
    id: "module-2",
    code: "MODULE 02",
    title: "Hadoop Architecture & MapReduce",
    description:
      "Trace data through HDFS, YARN and the MapReduce pipeline, then reason about search, sorting and compression.",
    duration: "6 h 20 min",
    progress: 32,
    accent: "#a78bfa",
    topics: [
      { id: "introducing-hadoop", title: "Introducing Hadoop", summary: "Why Hadoop was created and when distributed processing beats an RDBMS.", kind: "concept" },
      { id: "rdbms-vs-hadoop", title: "RDBMS vs Hadoop", summary: "Compare schema, scaling, fault tolerance and workloads side by side.", kind: "numerical" },
      { id: "hadoop-history", title: "History and overview of Hadoop", summary: "Follow the ecosystem from distributed storage to the modern platform.", kind: "concept" },
      { id: "hadoop-use-case", title: "A Hadoop use case", summary: "Turn a large log collection into a distributed processing problem.", kind: "demo" },
      { id: "hdfs", title: "HDFS: Hadoop Distributed File System", summary: "Understand NameNode, DataNode, blocks, replication and fault tolerance.", kind: "demo" },
      { id: "processing-with-hadoop", title: "Processing data with Hadoop", summary: "Follow a file from ingestion to a completed distributed job.", kind: "demo" },
      { id: "yarn", title: "Hadoop YARN", summary: "See how ResourceManager and NodeManagers coordinate applications.", kind: "concept" },
      { id: "mapper", title: "Mapper", summary: "Transform input records into intermediate key-value pairs.", kind: "code" },
      { id: "reducer", title: "Reducer", summary: "Aggregate grouped intermediate values into the final output.", kind: "code" },
      { id: "combiner-partitioner", title: "Combiner and Partitioner", summary: "Reduce network traffic and route keys to the right reducer.", kind: "concept" },
      { id: "search-sorting", title: "Searching and Sorting", summary: "Explore the shuffle, sort and partition stages of a MapReduce job.", kind: "numerical" },
      { id: "compression", title: "Compression", summary: "Reason about storage, transfer cost and compression choices.", kind: "concept" },
    ],
    practicals: ["Install Hadoop and add, retrieve and delete files in HDFS", "Implement matrix multiplication with MapReduce", "Mine weather data and display daily conditions", "Find movie tags from MovieLens data", "Implement word count in Hadoop"],
    numericals: ["Calculate HDFS block count and replication storage", "Trace word count through Mapper, Shuffle and Reducer", "Estimate network savings from a Combiner"],
    snippets: ["Java WordCount Mapper and Reducer", "Python matrix multiplication mapper", "HDFS file management commands", "YARN job anatomy", "Weather data MapReduce skeleton"],
  },
  {
    id: "module-3",
    code: "MODULE 03",
    title: "MongoDB & NoSQL Data Models",
    description:
      "Move from relational tables to flexible documents, query collections and build an aggregation mindset.",
    duration: "3 h 10 min",
    progress: 18,
    accent: "#34d399",
    topics: [
      { id: "what-is-mongodb", title: "What is MongoDB?", summary: "Understand the document database approach and its common use cases.", kind: "concept" },
      { id: "why-mongodb", title: "Why MongoDB", summary: "Connect flexible schemas and horizontal scaling to application needs.", kind: "concept" },
      { id: "rdbms-mongodb-terms", title: "RDBMS and MongoDB terminology", summary: "Translate tables, rows and columns into databases, collections and documents.", kind: "demo" },
      { id: "mongodb-types", title: "Data types in MongoDB", summary: "Work with strings, arrays, embedded documents, dates and object identifiers.", kind: "code" },
      { id: "mongodb-query-language", title: "MongoDB Query Language", summary: "Practice find, update, count, sort, limit, skip and aggregate operations.", kind: "numerical" },
    ],
    practicals: ["Implement Count, Sort, Limit, Skip and Aggregate using MongoDB"],
    numericals: ["Design a document model for an event stream", "Build an aggregation pipeline for grouped analytics"],
    snippets: ["MongoDB collection and document examples", "Aggregation pipeline starter", "Indexing and query examples", "RDBMS-to-MongoDB translation table"],
  },
  {
    id: "module-4",
    code: "MODULE 04",
    title: "Hive & Pig Analytics",
    description:
      "Use high-level data languages to query, transform and move data through Hadoop without writing every low-level job.",
    duration: "5 h 05 min",
    progress: 0,
    accent: "#f59e0b",
    topics: [
      { id: "what-is-hive", title: "What is Hive?", summary: "See why SQL-like analysis is useful on distributed data.", kind: "concept" },
      { id: "hive-architecture", title: "Hive Architecture", summary: "Explore clients, drivers, compiler, execution engine and metastore.", kind: "demo" },
      { id: "hive-data-types", title: "Hive data types and file formats", summary: "Choose primitive, complex and storage formats for analytics workloads.", kind: "concept" },
      { id: "hql", title: "Hive Query Language (HQL)", summary: "Create, alter and query databases, tables, views, functions and indexes.", kind: "code" },
      { id: "rc-file", title: "RCFile implementation", summary: "Understand row-columnar storage and its effect on scans.", kind: "numerical" },
      { id: "hive-udf", title: "Hive User Defined Functions", summary: "Extend HQL for a domain-specific transformation.", kind: "code" },
      { id: "what-is-pig", title: "What is Pig?", summary: "Introduce Pig as a dataflow language for large-scale transformations.", kind: "concept" },
      { id: "pig-anatomy", title: "Anatomy and philosophy of Pig", summary: "Break a Pig Latin script into load, transform and store stages.", kind: "demo" },
      { id: "pig-on-hadoop", title: "Pig on Hadoop and use cases", summary: "Place Pig scripts on top of distributed execution.", kind: "concept" },
      { id: "pig-latin", title: "Pig Latin overview and data types", summary: "Learn aliases, tuples, bags, maps and the Pig Latin flow.", kind: "code" },
      { id: "running-pig", title: "Running Pig and execution modes", summary: "Compare local and MapReduce execution modes.", kind: "concept" },
      { id: "hdfs-commands", title: "HDFS commands", summary: "Move between Pig workflows and the files that feed them.", kind: "code" },
      { id: "pig-operators", title: "Relational operators and Eval functions", summary: "Sort, group, join, project and filter data with Pig Latin.", kind: "demo" },
      { id: "pig-complex-types", title: "Complex data types and Piggy Bank", summary: "Use reusable functions with nested data and libraries.", kind: "concept" },
      { id: "pig-vs-hive", title: "Pig vs Hive", summary: "Select the right abstraction for a data engineering task.", kind: "numerical" },
    ],
    practicals: ["Write Pig Latin scripts to sort, group, join, project and filter", "Use Hive to create, alter and drop data objects"],
    numericals: ["Estimate scan savings from a columnar format", "Trace a Pig dataflow from load to store"],
    snippets: ["HQL table and aggregation starter", "Pig Latin transformation pipeline", "Hive UDF and Piggy Bank references"],
  },
  {
    id: "module-5",
    code: "MODULE 05",
    title: "Spark, Text & Web Analytics",
    description:
      "Finish the syllabus with Spark data analysis, text mining, web usage analytics and PageRank on a web graph.",
    duration: "4 h 15 min",
    progress: 0,
    accent: "#fb7185",
    topics: [
      { id: "spark", title: "Apache Spark", summary: "Understand Spark's fast, in-memory approach to data analysis.", kind: "concept" },
      { id: "spark-analysis", title: "Introduction to Data Analysis with Spark", summary: "Use a simple Spark workflow to load, transform and inspect data.", kind: "code" },
      { id: "text-mining", title: "Text Mining", summary: "Turn unstructured text into tokens, features and useful signals.", kind: "demo" },
      { id: "web-mining", title: "Web Mining", summary: "Distinguish content, usage and link analytics on web data.", kind: "concept" },
      { id: "web-content-usage", title: "Web Content and Web Usage Analytics", summary: "Connect page content and visitor behaviour to analytics questions.", kind: "numerical" },
      { id: "pagerank", title: "PageRank", summary: "Calculate importance scores by iterating across linked pages.", kind: "numerical" },
      { id: "web-structure", title: "Structure of the Web", summary: "Model the web as a directed graph of pages and links.", kind: "demo" },
      { id: "web-graph", title: "Analysing a Web Graph", summary: "Read graph relationships and identify hubs, authorities and paths.", kind: "concept" },
      { id: "word-count-spark", title: "Word count in Spark", summary: "Compare the classic word-count flow in Hadoop and Spark.", kind: "code" },
    ],
    practicals: ["Implement word count using Hadoop and Spark", "Use CDH and HUE to analyse sample datasets and generate reports"],
    numericals: ["Run one PageRank iteration on a small graph", "Calculate TF-IDF-style term importance", "Compare batch stages in Hadoop and Spark"],
    snippets: ["Spark word count starter", "PageRank iteration pseudocode", "Text tokenisation and feature extraction"],
  },
];

export function getSyllabusModule(moduleId: string | undefined) {
  return syllabusModules.find((module) => module.id === moduleId) ?? syllabusModules[0];
}

export function searchSyllabus(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return syllabusModules.flatMap((module) =>
    module.topics
      .filter((topic) => `${topic.title} ${topic.summary} ${module.title}`.toLowerCase().includes(normalized))
      .map((topic) => ({ module, topic })),
  );
}