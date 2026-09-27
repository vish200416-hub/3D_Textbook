import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  clampLabConfig,
  type LabConfig,
  type LearningSceneController,
  type SceneBuildContext,
  type SelectedObjectInfo,
} from "@/lib/three/types";

const COLORS = {
  cyan: "#22d3ee",
  violet: "#a78bfa",
  amber: "#fbbf24",
  green: "#34d399",
  pink: "#fb7185",
  slate: "#94a3b8",
};

export function createLearningScene(
  container: HTMLDivElement,
  initialConfig: LabConfig,
  onSelect: (info: SelectedObjectInfo | null) => void,
): LearningSceneController {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x09111e, 14, 30);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const defaultCameraPosition = new THREE.Vector3(10, 8, 13);
  camera.position.copy(defaultCameraPosition);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x07111f, 0);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.minDistance = 5;
  controls.maxDistance = 24;
  controls.target.set(0, 0.7, 0);

  scene.add(new THREE.HemisphereLight(0xb8e8ff, 0x111827, 2.2));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(5, 10, 7);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0x8b5cf6, 18, 18);
  rimLight.position.set(-5, 4, -4);
  scene.add(rimLight);

  const world = new THREE.Group();
  scene.add(world);
  const selectable: THREE.Object3D[] = [];
  const infoByObject = new WeakMap<THREE.Object3D, SelectedObjectInfo>();
  const packets: Array<{ mesh: THREE.Mesh; path: THREE.Vector3[]; offset: number }> = [];
  let config = clampLabConfig(initialConfig);
  let animationPlaying = true;
  let animationTime = 0;
  let highlighted: THREE.Object3D | null = null;
  let frame = 0;
  let disposed = false;

  const makeInfo = (id: string, name: string, type: string, description: string, properties: string[]): SelectedObjectInfo => ({ id, name, type, description, properties });

  const register = (object: THREE.Object3D, info: SelectedObjectInfo) => {
    object.userData.learningInfo = info;
    selectable.push(object);
    infoByObject.set(object, info);
  };

  const addLabel = (text: string, color: string, x: number, y: number, z: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = 360;
    canvas.height = 92;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(7, 17, 31, .78)";
    context.roundRect(4, 9, 352, 74, 18);
    context.fill();
    context.strokeStyle = color;
    context.globalAlpha = 0.7;
    context.stroke();
    context.globalAlpha = 1;
    context.font = "600 25px Inter, sans-serif";
    context.fillStyle = "#f8fafc";
    context.fillText(text, 22, 54);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(material);
    sprite.userData.layer = "labels";
    sprite.position.set(x, y, z);
    sprite.scale.set(2.35, 0.6, 1);
    world.add(sprite);
  };

  const makeMaterial = (color: string, emissive = color, opacity = 1) => new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: 0.25, metalness: 0.35, roughness: 0.48, transparent: opacity < 1, opacity });

  const addMesh = (mesh: THREE.Mesh, info: SelectedObjectInfo) => {
    register(mesh, info);
    world.add(mesh);
    return mesh;
  };

  const addLine = (from: THREE.Vector3, to: THREE.Vector3, color: string, opacity = 0.45) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    const line = new THREE.Line(geometry, material);
    line.userData.layer = "connections";
    world.add(line);
  };

  const addPacket = (path: THREE.Vector3[], offset: number, color: string) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), new THREE.MeshBasicMaterial({ color }));
    mesh.userData.layer = "flow";
    mesh.position.copy(path[0]);
    world.add(mesh);
    packets.push({ mesh, path, offset });
  };

  const clearWorld = () => {
    while (world.children.length > 0) {
      const child = world.children[0];
      child.traverse((object) => {
        const renderable = object as THREE.Mesh;
        renderable.geometry?.dispose();
        const materials = Array.isArray(renderable.material) ? renderable.material : [renderable.material];
        materials.filter(Boolean).forEach((material) => {
          if ("map" in material && material.map instanceof THREE.Texture) material.map.dispose();
          material.dispose();
        });
      });
      world.remove(child);
    }
    selectable.splice(0, selectable.length);
    packets.splice(0, packets.length);
    highlighted = null;
  };

  const buildHdfs = (context: SceneBuildContext) => {
    const clientPosition = new THREE.Vector3(0, 3.4, 0);
    const namePosition = new THREE.Vector3(0, 1.1, 0);
    const client = addMesh(new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.72, 24), makeMaterial(COLORS.green, "#064e3b")), makeInfo("client", "Client", "Request origin", "The client asks the NameNode where data belongs before streaming it to a DataNode.", ["Requests file locations", "Reads and writes data", "Does not store namespace metadata"]));
    client.position.copy(clientPosition);
    const nameNode = addMesh(new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 1.5), makeMaterial(COLORS.violet, "#4c1d95")), makeInfo("namenode", "NameNode", "Metadata manager", "The NameNode manages metadata and the namespace of the distributed file system.", ["Tracks file names", "Maps blocks to DataNodes", "Coordinates replication"]));
    nameNode.position.copy(namePosition);
    addLabel("Client", COLORS.green, -1.05, 3.5, 0);
    addLabel("NameNode", COLORS.violet, 1.4, 1.15, 0);
    addLine(clientPosition, namePosition, COLORS.green, 0.6);

    const nodePositions: THREE.Vector3[] = [];
    for (let index = 0; index < config.dataNodes; index += 1) {
      const angle = (index / config.dataNodes) * Math.PI * 2 - Math.PI / 2;
      const position = new THREE.Vector3(Math.cos(angle) * 4.25, -0.8, Math.sin(angle) * 3.25);
      nodePositions.push(position);
      const node = addMesh(new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.25, 1.05), makeMaterial(COLORS.cyan, "#164e63")), makeInfo(`datanode-${index + 1}`, `DataNode ${index + 1}`, "Storage node", "A DataNode stores the actual blocks of a file and reports its health to the NameNode.", ["Stores file blocks", "Sends heartbeats", "Hosts replicas"]));
      node.position.copy(position);
      addLabel(`DataNode ${index + 1}`, COLORS.cyan, position.x - 0.8, position.y - 1.05, position.z);
      addLine(namePosition, position, COLORS.cyan, 0.28);
    }

    for (let block = 0; block < config.blocks; block += 1) {
      for (let replica = 0; replica < config.replicas; replica += 1) {
        const nodeIndex = (block + replica) % nodePositions.length;
        const nodePosition = nodePositions[nodeIndex];
        const localOffset = new THREE.Vector3((replica - (config.replicas - 1) / 2) * 0.26, 0.94 + (block % 2) * 0.18, ((block % 3) - 1) * 0.18);
        const blockMesh = addMesh(new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.33, 0.33), makeMaterial(replica === 0 ? COLORS.amber : COLORS.pink, replica === 0 ? "#78350f" : "#831843", replica === 0 ? 1 : 0.75)), makeInfo(`block-${block + 1}-replica-${replica + 1}`, replica === 0 ? `Block ${block + 1}` : `Block ${block + 1} · Replica ${replica + 1}`, "HDFS data block", "A large file is divided into blocks so the cluster can store, process and replicate it in parallel.", ["Logical size: 128 MB", `Replica copy ${replica + 1} of ${config.replicas}`, `Hosted by DataNode ${nodeIndex + 1}`]));
        blockMesh.position.copy(nodePosition).add(localOffset);
        blockMesh.userData.layer = "blocks";
      }
    }

    for (let packetIndex = 0; packetIndex < Math.max(3, config.dataNodes); packetIndex += 1) {
      const target = nodePositions[packetIndex % nodePositions.length];
      addPacket([clientPosition, namePosition, target], packetIndex * 0.23, COLORS.green);
    }
    void context;
  };

  const buildFoundations = () => {
    const labels = ["Volume", "Velocity", "Variety", "Veracity", "Value"];
    labels.forEach((label, index) => {
      const angle = (index / labels.length) * Math.PI * 2;
      const position = new THREE.Vector3(Math.cos(angle) * 3.4, -0.1, Math.sin(angle) * 3.4);
      const pillar = addMesh(new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.82, 2 + (index % 3) * 0.6, 18), makeMaterial([COLORS.cyan, COLORS.violet, COLORS.amber, COLORS.green, COLORS.pink][index], "#082f49")), makeInfo(`v-${index}`, label, "Big Data characteristic", `The ${label} dimension changes how a data platform must collect, store and analyse information.`, ["Part of the 5Vs", "Shapes architecture decisions", "Connects theory to a workload"]));
      pillar.position.copy(position);
      addLabel(label, [COLORS.cyan, COLORS.violet, COLORS.amber, COLORS.green, COLORS.pink][index], position.x - 0.7, 1.9, position.z);
      addLine(new THREE.Vector3(0, 0, 0), position, COLORS.slate, 0.22);
    });
    const center = addMesh(new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), makeMaterial(COLORS.violet, "#4c1d95")), makeInfo("analytics-core", "Analytics Core", "Decision layer", "Big Data analytics turns raw scale, speed and variety into decisions and measurable value.", ["Descriptive analytics", "Predictive analytics", "Prescriptive analytics"]));
    center.position.y = 1;
    addLabel("Analytics", COLORS.violet, -0.8, 2.25, 0);
  };

  const buildMongo = () => {
    const center = new THREE.Vector3(0, 0.3, 0);
    const cluster = addMesh(new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 1.5, 28), makeMaterial(COLORS.green, "#064e3b")), makeInfo("mongo-cluster", "MongoDB Cluster", "Document database", "MongoDB stores flexible documents inside collections and can distribute them across a cluster.", ["Document model", "Aggregation pipeline", "Horizontal scaling"]));
    cluster.position.copy(center);
    addLabel("MongoDB", COLORS.green, 1.4, 0.7, 0);
    for (let index = 0; index < config.dataNodes; index += 1) {
      const angle = (index / config.dataNodes) * Math.PI * 2;
      const position = new THREE.Vector3(Math.cos(angle) * 3.8, 0.2, Math.sin(angle) * 3.8);
      const document = addMesh(new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.82, 0.82), makeMaterial(COLORS.cyan, "#164e63")), makeInfo(`document-${index + 1}`, `Document ${index + 1}`, "MongoDB document", "A document keeps related fields together and can evolve without a rigid table schema.", ["JSON-like structure", "Nested fields", "Query-friendly"]));
      document.position.copy(position);
      addLabel(`Doc ${index + 1}`, COLORS.cyan, position.x - 0.5, 1.1, position.z);
      addLine(center, position, COLORS.green, 0.3);
      addPacket([center, position], index * 0.22, COLORS.amber);
    }
  };

  const buildHivePig = () => {
    const labels = ["Load", "Filter", "Group", "Join", "Store"];
    const positions = labels.map((_, index) => new THREE.Vector3((index - 2) * 2.1, 0.5, 0));
    labels.forEach((label, index) => {
      const stage = addMesh(new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.15, 1.25), makeMaterial(index % 2 === 0 ? COLORS.amber : COLORS.violet, index % 2 === 0 ? "#78350f" : "#4c1d95")), makeInfo(`stage-${index}`, label, "Dataflow stage", `${label} is one step in a high-level analytics pipeline executed over distributed data.`, ["Relational operator", "Distributed execution", "Readable workflow"]));
      stage.position.copy(positions[index]);
      addLabel(label, index % 2 === 0 ? COLORS.amber : COLORS.violet, positions[index].x - 0.55, 1.75, 0);
      if (index < positions.length - 1) addLine(positions[index], positions[index + 1], COLORS.cyan, 0.5);
      if (index < positions.length - 1) addPacket([positions[index], positions[index + 1]], index * 0.18, COLORS.green);
    });
  };

  const buildSparkWeb = () => {
    const graphCount = config.dataNodes + config.blocks;
    const positions: THREE.Vector3[] = [];
    for (let index = 0; index < graphCount; index += 1) {
      const angle = (index / graphCount) * Math.PI * 2;
      positions.push(new THREE.Vector3(Math.cos(angle) * (2.8 + (index % 2) * 1.2), (index % 3) * 0.75 - 0.7, Math.sin(angle) * (2.8 + (index % 2) * 1.2)));
    }
    positions.forEach((position, index) => {
      const node = addMesh(new THREE.Mesh(new THREE.SphereGeometry(index % 3 === 0 ? 0.48 : 0.33, 20, 14), makeMaterial(index % 3 === 0 ? COLORS.pink : COLORS.cyan, index % 3 === 0 ? "#831843" : "#164e63")), makeInfo(`graph-${index}`, `Graph node ${index + 1}`, "Web graph vertex", "A page or text document becomes a graph node that can receive a relevance score.", ["Incoming links", "Outgoing links", "PageRank score"]));
      node.position.copy(position);
      addLabel(`P${index + 1}`, COLORS.pink, position.x - 0.25, position.y + 0.75, position.z);
      const next = positions[(index + 1) % positions.length];
      addLine(position, next, COLORS.violet, 0.35);
      addPacket([position, next], index * 0.14, COLORS.amber);
    });
  };

  const buildWorld = () => {
    clearWorld();
    const context: SceneBuildContext = { world, selectable, register, addLabel };
    if (config.mode === "hdfs") buildHdfs(context);
    if (config.mode === "foundations") buildFoundations();
    if (config.mode === "mongodb") buildMongo();
    if (config.mode === "hive-pig") buildHivePig();
    if (config.mode === "spark-web") buildSparkWeb();
  };

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const getHit = (event: PointerEvent) => {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(selectable, false)[0]?.object ?? null;
  };

  const setHighlight = (object: THREE.Object3D | null) => {
    if (highlighted === object) return;
    const restore = (item: THREE.Object3D | null, active: boolean) => {
      if (!item) return;
      const mesh = item as THREE.Mesh;
      const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      if (material && "emissiveIntensity" in material) {
        material.emissiveIntensity = active ? 0.85 : 0.25;
      }
      mesh.scale.setScalar(active ? 1.1 : 1);
    };
    restore(highlighted, false);
    highlighted = object;
    restore(highlighted, true);
  };

  const onPointerMove = (event: PointerEvent) => setHighlight(getHit(event));
  const onPointerDown = (event: PointerEvent) => {
    const hit = getHit(event);
    if (hit) onSelect(infoByObject.get(hit) ?? null);
    else onSelect(null);
  };
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerdown", onPointerDown);

  const resize = () => {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();
  buildWorld();

  const clock = new THREE.Clock();
  const animate = () => {
    if (disposed) return;
    frame = window.requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05);
    if (animationPlaying) {
      animationTime += delta;
      packets.forEach((packet) => {
        const progress = (animationTime * config.flowSpeed * 0.18 + packet.offset) % 1;
        const segment = Math.min(packet.path.length - 2, Math.floor(progress * (packet.path.length - 1)));
        const localProgress = progress * (packet.path.length - 1) - segment;
        packet.mesh.position.lerpVectors(packet.path[segment], packet.path[segment + 1], localProgress);
      });
    }
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  return {
    updateConfig: (nextConfig) => {
      config = clampLabConfig(nextConfig);
      buildWorld();
    },
    setPlaying: (playing) => { animationPlaying = playing; },
    setLayerVisible: (layer, visible) => {
      world.traverse((object) => {
        if (object.userData.layer === layer) object.visible = visible;
      });
    },
    resetAnimation: () => {
      animationTime = 0;
      packets.forEach((packet) => packet.mesh.position.copy(packet.path[0]));
    },
    resetCamera: () => {
      camera.position.copy(defaultCameraPosition);
      controls.target.set(0, 0.7, 0);
      controls.update();
    },
    dispose: () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      controls.dispose();
      clearWorld();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

export async function loadLearningModel(url: string) {
  const loader = new GLTFLoader();
  return loader.loadAsync(url);
}