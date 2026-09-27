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

## Phase 2 additions

- `/lab` is now a live Three.js learning lab with procedural fallback scenes for HDFS, Big Data 5Vs, MongoDB, Hive/Pig and Spark/web analytics.
- The HDFS scene includes Client, NameNode, DataNodes, blocks, replicas, connection lines, raycast selection, hover highlighting, packet animation, camera reset and OrbitControls.
- Dynamic sliders change DataNodes, blocks, replication, flow speed and dataset scale; the Numerical Lens recalculates simplified educational metrics.
- A reusable `createLearningScene()` factory and `ThreeLearningLab` React wrapper dispose renderers, controls, geometries, materials, labels and event listeners safely.
- `GLTFLoader` is imported and exposed through `loadLearningModel()` for future approved assets; the preview intentionally uses procedural geometry and no model download.

## Intentionally deferred

## Phase 3 additions

- A global classroom interaction dock is available on every route; there is no separate gesture page. Camera activation is explicit and normal mouse/touch controls always remain available.
- MediaPipe Tasks Vision runs HandLandmarker plus the Tasks-compatible 896-box BlazeFace detector locally. The controller associates each detected wrist with the nearest detected face, preserves handedness as a lock hint, displays confidence, and releases the lock after the hand disappears. Any face graph failure is isolated and automatically falls back to highest-confidence hand tracking instead of crashing the application.
- Strict multi-frame gesture state machine: index pointing controls a virtual cursor, deliberate double finger-tap clicks, thumb-index distance zooms, two raised fingers rotate the 3D camera, and open-palm horizontal/vertical slides navigate topics or scroll.
- Optional Web Speech commands support next/previous, start/pause animation, reset model, open gesture controls, explain NameNode, show DataNodes, open lab and open progress. Unsupported voice/camera states provide mouse fallbacks.
- Every mapped module topic now has textbook explanation paragraphs, a concrete example, key points and a takeaway. The module view exposes Learn, Practice, Code and Quiz only; the 3D Lab remains a dedicated sidebar page. Practice contains worked numericals with given values, calculations, final answers and concept explanations. One three-question explained quiz is available for each module.
- Progress persists in localStorage: topics read, models and objects explored, module quiz scores, revision topics, gestures and voice commands. `/progress` visualizes the totals and offers a confirmation-gated reset.

## Mocked/local features

The 3D lab's `Explain this` response is predefined local text rather than a live AI API. No camera frame or landmark leaves the browser. The first MediaPipe activation downloads pinned WASM/model assets from official hosts; normal controls remain available if loading fails.