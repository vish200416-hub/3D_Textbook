# Learn Beyond — Phase 1 Specification

## Product

Learn Beyond is a React + TypeScript interactive textbook foundation for VTU Big Data Analytics (BAD601 / BCS714D). Phase 1 is intentionally frontend-only and uses static, local syllabus data so the project can be explored without a backend or API key.

## Data model

- `syllabusSubject`: subject identity, syllabus code, description and overall progress.
- `SyllabusModule`: five VTU modules with progress, duration, topics, practical experiments, numerical prompts and code-snippet entry points.
- `SyllabusTopic`: topic id, title, summary and learning kind (`concept`, `demo`, `numerical`, `code`).

## Key flows

1. Home dashboard → Start learning → Big Data Analytics subject overview.
2. Subject overview → filter modules/topics → open a module.
3. Module page → switch Learn, Explore, Practice and Code lab tabs.
4. Global search → select a topic result → open its module.
5. Sidebar navigation → future 3D lab, gesture, progress and settings preview routes.
6. Theme toggle switches the glassmorphic interface between dark and light modes.

## VTU content coverage

The five modules cover the official extracted 2022-scheme topics: Big Data foundations and analytics, Hadoop/HDFS/YARN/MapReduce, MongoDB, Hive and Pig, and Spark plus text/web/link analytics. Practical prompts include HDFS file management, matrix multiplication, weather mining, MovieLens tags, MongoDB operations, Pig, Hive, Hadoop/Spark word count and CDH/HUE.

## Auth and roles

No authentication or roles in Phase 1. Progress is currently representative static UI data; localStorage persistence is reserved for the progress/quiz phase.

## Intentionally deferred

Three.js scenes, GLTF loading, raycast selection, animations, MediaPipe gestures, virtual cursor, Web Speech commands, quizzes, persistent local progress and AI explanation are planned for later phases and appear as connected previews where appropriate.