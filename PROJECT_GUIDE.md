# Learn Beyond — Final Project Guide

## Project structure

```text
/app
├── frontend/
│   ├── index.html                         # Browser entry and metadata
│   └── src/
│       ├── App.tsx                        # Route table
│       ├── components/
│       │   ├── AppShell.tsx               # Sidebar, search, theme and global controls
│       │   ├── GlobalInteractionController.tsx # Camera, gestures, hand lock and voice
│       │   ├── ModuleQuiz.tsx             # Reusable explained quiz flow
│       │   └── ThreeLearningLab.tsx       # React wrapper for the Three.js engine
│       ├── data/
│       │   ├── syllabus.ts                # Five VTU modules and topic metadata
│       │   ├── topicContent.ts            # Topic explanation generator
│       │   └── quizzes.ts                 # One quiz for every VTU module
│       ├── lib/
│       │   ├── gesture/
│       │   │   ├── vision.ts              # MediaPipe task initialization
│       │   │   └── recognition.ts         # Hand/face association and gesture state machine
│       │   ├── three/
│       │   │   ├── learningScene.ts       # Scene, camera, models, Raycaster and animation
│       │   │   └── types.ts               # 3D configuration and metric types
│       │   ├── progress.ts                # localStorage progress store
│       │   └── voice.ts                   # Web Speech commands
│       └── pages/
│           ├── Home.tsx                   # Dashboard
│           ├── Subject.tsx                # VTU module selection
│           ├── Module.tsx                 # Learn/Explore/Practice/Code/Quiz reader
│           ├── Lab.tsx                    # Interactive multi-model 3D lab
│           └── Progress.tsx               # Persistent learning dashboard
├── backend/                               # Existing FastAPI template health/status API
└── memory/SPEC.md                         # Living functional specification
```

React + TypeScript replaces the original many-file vanilla JavaScript proposal because the supplied project already had a strict, working React/Vite foundation. Responsibilities are still separated into small beginner-readable modules; Three.js and MediaPipe remain ordinary browser libraries rather than framework-specific abstractions.

## How to run

The managed preview is available at:

`https://learn-beyond-page.preview.emergentagent.com`

For a local terminal in the project environment:

```bash
cd /app/frontend
yarn dev
```

Open `http://localhost:3000`. Camera access needs HTTPS or localhost. The first gesture activation needs internet access to download the pinned MediaPipe WASM and model assets. Normal mouse and touch controls work if those assets or camera permission are unavailable.

## Complete feature list

- Futuristic responsive dashboard, sidebar, theme switch, module cards and syllabus search.
- Five VTU Big Data Analytics modules with every mapped topic selectable.
- Topic definitions, examples, key points, takeaways, previous/next navigation and gesture swipe navigation.
- Five Three.js visualization modes: Big Data 5Vs, HDFS, MongoDB, Hive/Pig and Spark/Web Graph.
- HDFS Client, NameNode, DataNodes, logical blocks, replicas and animated data flow.
- Orbit rotation, pan, zoom, camera reset, animation play/pause/reset and scene layer visibility.
- Raycaster hover/selection with object descriptions and local “Explain This” responses.
- Dynamic DataNode, block, replication, flow-speed and dataset-size parameters.
- Numerical Lens that recalculates educational values as parameters change.
- Whole-site MediaPipe hand control with nearest-face hand association and visible confidence.
- Virtual pointer, deliberate double-tap click, pinch-distance zoom, two-finger rotation and palm-slide navigation/scroll.
- Whole-site optional Web Speech commands with unsupported-browser fallback.
- One explained multiple-choice quiz per VTU module, scores and revision topics.
- Browser-persistent topic, model, object, quiz, gesture and voice progress.
- Progress dashboard with overall signal, module performance and reset confirmation.
- Camera/model/voice failure messages and continuous mouse/touch fallback.

## Technologies used

- React 19, TypeScript and Vite
- Tailwind CSS v4 and shadcn/ui
- Three.js, OrbitControls, Raycaster and GLTFLoader
- MediaPipe Tasks Vision: HandLandmarker and Tasks-compatible BlazeFace FaceDetector
- Web Speech API / SpeechRecognition
- Browser localStorage
- FastAPI template API and MongoDB connectivity probe

## Architecture

The UI reads static curriculum data from `data/`. Pages compose reusable components. The Three.js engine is kept outside React in `lib/three/learningScene.ts`; React sends it typed configuration values and receives selected-object metadata. The global interaction dock emits semantic browser events such as `lesson-zoom`, `lesson-rotate`, `lesson-swipe` and `voice-command`. This decouples gestures and voice from individual pages. The local progress module provides one shared store backed by localStorage.

## Main algorithms

### Raycaster object interaction

`THREE.Raycaster` creates an invisible ray from the camera through a normalized pointer position. Three.js tests that ray against selectable meshes. The closest intersection identifies the educational object. Its reusable metadata contains the object id, title, type, explanation and properties. The selected mesh receives stronger emissive light and a small scale increase.

### HDFS block calculation

The visualization uses:

```text
physical block copies = logical blocks × replication factor
average copies per DataNode = physical copies ÷ DataNode count
```

The scene rebuilds procedural blocks after a slider change, and the Numerical Lens updates from the same typed configuration. This keeps the picture and calculation synchronized.

### Face-to-hand locking

MediaPipe returns normalized face boxes and 21 landmarks for each visible hand. The app uses the FaceDetector Tasks-compatible BlazeFace model, then calculates the two-dimensional distance from each hand wrist to each face center. The minimum distance wins. The previous handedness receives a small preference so the lock does not rapidly jump between hands. If face detection fails, the error is isolated and gesture control continues with the highest-confidence hand rather than crashing. If the locked hand disappears for about 700 milliseconds, the lock is released.

### Gesture recognition

Finger extension is estimated by comparing fingertip-to-wrist distance with the corresponding middle-joint-to-wrist distance. A state machine requires several consecutive frames before acting:

- Index only: virtual pointer.
- Two deliberate tap-pose transitions within 520 ms: click.
- Change in thumb-to-index distance: zoom.
- Stable index and middle fingers plus angle change: rotate.
- Stable open palm plus horizontal/vertical displacement: topic navigation or page scroll.

Cooldowns reduce repeated clicks and swipes. Mouse, touch and keyboard behavior is never disabled.

## College viva explanation

1. Start with the problem: static diagrams cannot show distributed relationships or changing parameters.
2. Explain the solution flow: textbook concept → procedural 3D model → object interaction → numerical manipulation → practice → quiz → progress.
3. Demonstrate HDFS and explain why NameNode metadata is separate from DataNode blocks.
4. Change block and replication sliders; derive the physical-copy formula aloud.
5. Select a component and explain how Raycaster maps a 2D pointer to a 3D mesh.
6. Enable gesture mode and explain that MediaPipe inference runs locally in the browser.
7. Explain nearest-face hand association as a classroom ownership heuristic.
8. Complete a quiz and show localStorage progress.
9. Emphasize reusable architecture: new scenes implement the same object-information and parameter model.

## Limitations

- Distant hand recognition depends on camera resolution, lens, lighting, contrast and the teacher’s apparent hand size. A standard laptop webcam cannot guarantee reliable tracking from every classroom distance.
- Face-to-hand distance is a practical ownership heuristic, not biometric identity verification.
- Browser SpeechRecognition support varies and may use the browser vendor’s online service.
- MediaPipe WASM/models download on first activation; self-hosting is preferable for an offline classroom.
- Procedural scenes intentionally simplify real distributed systems and numerical assumptions.
- Progress is browser-local and does not follow a user to another device.

## Performance improvements

- Self-host and pre-cache pinned MediaPipe models before class.
- Run MediaPipe inference in a Web Worker and use OffscreenCanvas when supported.
- Dynamically lower camera inference resolution when frame time increases.
- Reuse Three.js geometries/materials through instancing for larger models.
- Pause 3D rendering and camera inference when the tab is hidden.
- Use compressed `.glb` assets with Draco/Meshopt for future detailed models.
- Add a teacher calibration step for camera distance, handedness and gesture thresholds.

## Future scope

- Teacher-authored simulations and syllabus content management.
- Cloud progress and multi-device student accounts.
- Detailed topic-specific simulations supplied by the subject expert.
- AI tutor, personalized revision and generated question banks.
- AR/VR presentation mode and shared classroom sessions.
- Offline model caching and projector-friendly presentation controls.