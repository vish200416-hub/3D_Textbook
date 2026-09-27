export interface WorkedNumerical {
  id: string;
  title: string;
  problem: string;
  given: string[];
  steps: string[];
  answer: string;
  concept: string;
}

export const moduleNumericals: Record<string, WorkedNumerical[]> = {
  "module-1": [
    {
      id: "volume-growth",
      title: "Data volume growth",
      problem: "A college stores 2 TB of analytics data in year 1. The volume grows by 50% each year. Find the volume at the end of year 3.",
      given: ["Initial volume = 2 TB", "Annual growth = 50%", "Growth periods = 2"],
      steps: ["Use V = V₀(1 + r)ⁿ", "V = 2(1 + 0.50)²", "V = 2 × 2.25"],
      answer: "4.5 TB",
      concept: "Volume grows multiplicatively; storage planning must account for compounding.",
    },
    {
      id: "velocity-rate",
      title: "Event ingestion velocity",
      problem: "500 sensors produce 4 readings per second. Each reading is 250 bytes. Calculate the incoming data rate per second.",
      given: ["Sensors = 500", "Readings = 4 per second", "Reading size = 250 bytes"],
      steps: ["Events per second = 500 × 4 = 2,000", "Data rate = 2,000 × 250 bytes", "Convert 500,000 bytes to approximately 0.5 MB"],
      answer: "500,000 bytes/s ≈ 0.5 MB/s",
      concept: "Velocity combines event frequency with the size of every event.",
    },
  ],
  "module-2": [
    {
      id: "hdfs-blocks",
      title: "HDFS blocks and replication",
      problem: "A 600 MB file is stored with a 128 MB HDFS block size and replication factor 3. Find the logical blocks and physical block copies.",
      given: ["File size = 600 MB", "Block size = 128 MB", "Replication factor = 3"],
      steps: ["Logical blocks = ceil(600 ÷ 128)", "Logical blocks = ceil(4.6875) = 5", "Physical copies = 5 × 3"],
      answer: "5 logical blocks and 15 physical block copies",
      concept: "The final partial block still counts as one logical block; every block is replicated.",
    },
    {
      id: "combiner-saving",
      title: "Combiner network saving",
      problem: "Four mappers each emit 10,000 word-count pairs. A combiner reduces each mapper output to 500 pairs. Calculate the reduction in shuffled pairs.",
      given: ["Original pairs = 4 × 10,000", "Combined pairs = 4 × 500"],
      steps: ["Original shuffle = 40,000 pairs", "New shuffle = 2,000 pairs", "Reduction = 40,000 − 2,000", "Percentage reduction = 38,000 ÷ 40,000 × 100"],
      answer: "38,000 fewer pairs, a 95% reduction",
      concept: "A combiner performs safe local aggregation before network transfer.",
    },
    {
      id: "cluster-load",
      title: "Average DataNode load",
      problem: "An HDFS file has 8 blocks with replication factor 2 across 4 DataNodes. Find the average number of block copies per DataNode.",
      given: ["Blocks = 8", "Replication = 2", "DataNodes = 4"],
      steps: ["Physical copies = 8 × 2 = 16", "Average load = 16 ÷ 4"],
      answer: "4 block copies per DataNode on average",
      concept: "The NameNode attempts balanced placement while respecting replica rules.",
    },
  ],
  "module-3": [
    {
      id: "aggregation-average",
      title: "MongoDB aggregation average",
      problem: "A collection contains department totals of 420, 510, 390 and 480 events. Find the average event count produced by a $group stage.",
      given: ["Values = 420, 510, 390, 480", "Documents = 4"],
      steps: ["Sum = 420 + 510 + 390 + 480 = 1,800", "Average = 1,800 ÷ 4"],
      answer: "450 events",
      concept: "$group with $avg calculates an aggregate across matching documents.",
    },
    {
      id: "skip-limit",
      title: "Pagination with skip and limit",
      problem: "A query displays 20 documents per page. How many documents must be skipped to display page 6?",
      given: ["Page size = 20", "Requested page = 6"],
      steps: ["skip = (page − 1) × page size", "skip = (6 − 1) × 20"],
      answer: "Skip 100 documents, then limit the result to 20",
      concept: "Page numbering starts after all documents from earlier pages are skipped.",
    },
  ],
  "module-4": [
    {
      id: "column-scan",
      title: "Column scan saving",
      problem: "A table has 10 equal-sized columns and occupies 2 GB. A columnar query reads only 2 columns. Estimate the data scanned, ignoring metadata and compression.",
      given: ["Table size = 2 GB", "Total columns = 10", "Columns required = 2"],
      steps: ["Fraction read = 2 ÷ 10 = 0.2", "Data scanned = 2 GB × 0.2"],
      answer: "Approximately 0.4 GB, an 80% scan reduction",
      concept: "Column-oriented formats avoid reading unrelated columns.",
    },
    {
      id: "pig-filter",
      title: "Pig pipeline record flow",
      problem: "A Pig relation loads 50,000 records. FILTER keeps 40%, and GROUP produces 200 groups. Find records after filtering and final grouped outputs.",
      given: ["Input = 50,000", "Filter selectivity = 40%", "Groups = 200"],
      steps: ["Filtered records = 50,000 × 0.40", "Grouped output has one result per group after aggregation"],
      answer: "20,000 filtered records and 200 grouped results",
      concept: "Each Pig operator transforms the relation passed to the next stage.",
    },
  ],
  "module-5": [
    {
      id: "pagerank-iteration",
      title: "One PageRank contribution",
      problem: "Page A has PageRank 0.9 and three outgoing links. With damping factor 0.85, find A's damped contribution to each linked page.",
      given: ["PR(A) = 0.9", "Outgoing links = 3", "Damping factor = 0.85"],
      steps: ["Raw contribution = 0.9 ÷ 3 = 0.3", "Damped contribution = 0.85 × 0.3"],
      answer: "0.255 to each linked page",
      concept: "A page divides its rank among outgoing links before damping is applied.",
    },
    {
      id: "tf-idf",
      title: "TF-IDF weight",
      problem: "A term appears 4 times in a 100-word document. It occurs in 10 of 1,000 documents. Using idf = log10(N/df), find TF-IDF.",
      given: ["TF = 4 ÷ 100 = 0.04", "N = 1,000", "df = 10"],
      steps: ["IDF = log10(1,000 ÷ 10) = log10(100) = 2", "TF-IDF = 0.04 × 2"],
      answer: "0.08",
      concept: "A term receives more weight when frequent in one document but rare across the collection.",
    },
  ],
};

export function getModuleNumericals(moduleId: string) {
  return moduleNumericals[moduleId] ?? [];
}