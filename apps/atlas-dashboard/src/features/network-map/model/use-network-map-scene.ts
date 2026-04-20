import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  CSS2DObject,
  CSS2DRenderer
} from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { dashboardToneStyles } from '@/entities/dashboard';
import type { NetworkGraphViewModel } from '@/entities/network-map';
import { atlasDashboardPalette } from '@/shared/theme/atlas-theme';

interface UseNetworkMapSceneOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  graph: NetworkGraphViewModel;
  onSelectNode: (nodeId: string) => void;
  open: boolean;
  selectedNodeId: string | null;
}

interface SceneNodeEntry {
  aura: THREE.Mesh | null;
  basePosition: THREE.Vector3;
  mesh: THREE.Mesh;
  node: NetworkGraphViewModel['nodes'][number];
  phaseOffset: number;
}

interface SceneLinkEntry {
  geometry: THREE.BufferGeometry;
  source: SceneNodeEntry;
  target: SceneNodeEntry;
}

export function useNetworkMapScene({
  containerRef,
  graph,
  onSelectNode,
  open,
  selectedNodeId
}: UseNetworkMapSceneOptions) {
  const selectedNodeIdRef = useRef<string | null>(selectedNodeId);

  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId;
  }, [selectedNodeId]);

  useEffect(() => {
    const container = containerRef.current;

    if (!open || !container) {
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(atlasDashboardPalette.bg);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1200
    );
    camera.position.set(0, 16, 158);

    const renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.width = '100%';

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(container.clientWidth, container.clientHeight);
    Object.assign(labelRenderer.domElement.style, {
      inset: '0',
      overflow: 'hidden',
      pointerEvents: 'none',
      position: 'absolute'
    });

    container.appendChild(renderer.domElement);
    container.appendChild(labelRenderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.7;
    controls.enableDamping = true;
    controls.maxDistance = 240;
    controls.maxPolarAngle = Math.PI * 0.8;
    controls.minDistance = 84;
    controls.minPolarAngle = Math.PI * 0.16;
    controls.target.set(0, 0, 0);
    controls.update();

    scene.add(new THREE.AmbientLight(0xffffff, 1.15));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.05);
    keyLight.position.set(80, 140, 120);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(atlasDashboardPalette.core, 22, 220, 2.1);
    fillLight.position.set(0, 10, 0);
    scene.add(fillLight);

    const graphRoot = new THREE.Group();
    scene.add(graphRoot);

    const starField = createStarField();
    scene.add(starField);

    const nodeEntries = new Map<string, SceneNodeEntry>();

    graph.nodes.forEach((node, index) => {
      const entry = createSceneNode(node, index);
      nodeEntries.set(node.id, entry);
      graphRoot.add(entry.mesh);
    });

    const linkEntries: SceneLinkEntry[] = graph.links.flatMap((link) => {
      const source = nodeEntries.get(link.sourceId);
      const target = nodeEntries.get(link.targetId);

      if (!source || !target) {
        return [];
      }

      const geometry = new THREE.BufferGeometry();
      const material = new THREE.LineBasicMaterial({
        color: resolveToneColor(link.tone),
        opacity: link.active ? 0.52 : 0.18,
        transparent: true
      });
      const line = new THREE.Line(geometry, material);
      graphRoot.add(line);

      return [
        {
          geometry,
          source,
          target
        }
      ];
    });

    const nodeMeshes = Array.from(nodeEntries.values()).map((entry) => entry.mesh);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const scaleTarget = new THREE.Vector3();
    const clock = new THREE.Clock();
    let frameHandle = 0;

    const updatePointer = (event: PointerEvent) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(nodeMeshes, false)[0];
    };

    const handlePointerMove = (event: PointerEvent) => {
      const hit = updatePointer(event);
      container.style.cursor = hit ? 'pointer' : 'grab';
    };

    const handlePointerDown = (event: PointerEvent) => {
      const hit = updatePointer(event);
      const nodeId = hit?.object.userData.nodeId;

      if (typeof nodeId === 'string') {
        onSelectNode(nodeId);
      }
    };

    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      labelRenderer.setSize(width, height);
    };

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      nodeEntries.forEach((entry) => {
        const amplitude = entry.node.kind === 'service' ? 1.5 : 1;
        const lift = Math.sin(elapsed * 0.7 + entry.phaseOffset) * amplitude;
        entry.mesh.position.set(
          entry.basePosition.x,
          entry.basePosition.y + lift,
          entry.basePosition.z
        );

        if (entry.aura) {
          entry.aura.rotation.z += 0.01;
        }

        const isSelected = entry.node.id === selectedNodeIdRef.current;
        const selectedScale = isSelected
          ? 1.16 + Math.sin(elapsed * 3 + entry.phaseOffset) * 0.04
          : 1;

        scaleTarget.setScalar(selectedScale);
        entry.mesh.scale.lerp(scaleTarget, 0.12);
      });

      linkEntries.forEach((entry) => {
        entry.geometry.setFromPoints([
          entry.source.mesh.position,
          entry.target.mesh.position
        ]);
      });

      starField.rotation.y = elapsed * 0.015;
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
      frameHandle = window.requestAnimationFrame(animate);
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    controls.addEventListener('start', () => {
      controls.autoRotate = false;
      container.style.cursor = 'grabbing';
    });
    controls.addEventListener('end', () => {
      container.style.cursor = 'grab';
    });
    container.style.cursor = 'grab';
    window.addEventListener('resize', handleResize);
    handleResize();
    animate();

    return () => {
      window.cancelAnimationFrame(frameHandle);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      controls.dispose();
      renderer.dispose();
      scene.clear();
      container.style.cursor = 'default';
      labelRenderer.domElement.remove();
      renderer.domElement.remove();
    };
  }, [containerRef, graph, onSelectNode, open]);
}

function createSceneNode(
  node: NetworkGraphViewModel['nodes'][number],
  index: number
): SceneNodeEntry {
  const color = new THREE.Color(resolveToneColor(node.tone));
  const size = resolveNodeSize(node.kind);
  const geometry = resolveNodeGeometry(node.kind, size);
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color.clone().multiplyScalar(node.active ? 0.16 : 0.04),
    emissiveIntensity: node.active ? 1 : 0.45,
    flatShading: true,
    metalness: 0.12,
    opacity: node.active ? 1 : 0.34,
    roughness: 0.42,
    transparent: true
  });
  const mesh = new THREE.Mesh(geometry, material);
  const basePosition = new THREE.Vector3(...node.position);
  mesh.position.copy(basePosition);
  mesh.userData.nodeId = node.id;

  const aura = createNodeAura(node.kind, size, color, node.active);

  if (aura) {
    mesh.add(aura);
  }

  const label = new CSS2DObject(createNodeLabel(node));
  label.position.set(0, size * 1.8, 0);
  mesh.add(label);

  return {
    aura,
    basePosition,
    mesh,
    node,
    phaseOffset: index * 0.72
  };
}

function createNodeAura(
  kind: NetworkGraphViewModel['nodes'][number]['kind'],
  size: number,
  color: THREE.Color,
  active: boolean
) {
  if (kind === 'service') {
    return null;
  }

  const aura = new THREE.Mesh(
    new THREE.TorusGeometry(size * 1.45, size * 0.08, 8, 56),
    new THREE.MeshBasicMaterial({
      color,
      opacity: active ? 0.48 : 0.16,
      transparent: true
    })
  );
  aura.rotation.x = Math.PI / 2;

  return aura;
}

function createNodeLabel(node: NetworkGraphViewModel['nodes'][number]) {
  const palette = dashboardToneStyles[node.tone];
  const root = document.createElement('div');
  root.style.alignItems = 'flex-start';
  root.style.display = 'flex';
  root.style.flexDirection = 'column';
  root.style.gap = '6px';
  root.style.maxWidth = '260px';
  root.style.pointerEvents = 'none';
  root.style.transform = 'translate(-50%, -100%)';

  const title = document.createElement('div');
  title.textContent = node.title;
  title.style.background = atlasDashboardPalette.panelAlt;
  title.style.borderRadius = '999px';
  title.style.color = atlasDashboardPalette.white;
  title.style.fontSize = '12px';
  title.style.fontWeight = '700';
  title.style.letterSpacing = '0.02em';
  title.style.opacity = node.active ? '1' : '0.7';
  title.style.padding = '8px 12px';

  const labelsRow = document.createElement('div');
  labelsRow.style.display = 'flex';
  labelsRow.style.flexWrap = 'wrap';
  labelsRow.style.gap = '6px';

  node.labels.forEach((labelText) => {
    const label = document.createElement('span');
    label.textContent = labelText;
    label.style.background = node.active ? palette.soft : atlasDashboardPalette.heroAlt;
    label.style.borderRadius = '999px';
    label.style.color = atlasDashboardPalette.white;
    label.style.fontSize = '11px';
    label.style.fontWeight = '600';
    label.style.opacity = node.active ? '0.96' : '0.62';
    label.style.padding = '6px 10px';
    labelsRow.appendChild(label);
  });

  root.appendChild(title);
  root.appendChild(labelsRow);

  return root;
}

function createStarField() {
  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];

  for (let index = 0; index < 480; index += 1) {
    vertices.push(
      THREE.MathUtils.randFloatSpread(420),
      THREE.MathUtils.randFloatSpread(280),
      THREE.MathUtils.randFloatSpread(420)
    );
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: atlasDashboardPalette.line,
      size: 1.2,
      transparent: true
    })
  );
}

function resolveNodeGeometry(
  kind: NetworkGraphViewModel['nodes'][number]['kind'],
  size: number
) {
  if (kind === 'gateway') {
    return new THREE.OctahedronGeometry(size, 1);
  }

  if (kind === 'plane') {
    return new THREE.IcosahedronGeometry(size, 1);
  }

  if (kind === 'host') {
    return new THREE.BoxGeometry(size * 1.5, size * 1.5, size * 1.5);
  }

  return new THREE.SphereGeometry(size, 24, 24);
}

function resolveNodeSize(kind: NetworkGraphViewModel['nodes'][number]['kind']) {
  if (kind === 'gateway') {
    return 7.2;
  }

  if (kind === 'plane') {
    return 5.8;
  }

  if (kind === 'host') {
    return 4.6;
  }

  return 3.8;
}

function resolveToneColor(tone: NetworkGraphViewModel['nodes'][number]['tone']) {
  return dashboardToneStyles[tone].accent;
}
