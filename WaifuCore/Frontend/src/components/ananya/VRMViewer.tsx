import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE_VRM from "@pixiv/three-vrm";

interface VRMViewerProps {
  speaking?: boolean;
  className?: string;
}

const VRMViewer: React.FC<VRMViewerProps> = ({ speaking = false, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  const cleanupRef = useRef<() => void>(() => {});
  const vrmRef = useRef<THREE_VRM.VRM | null>(null);
  const lipValueRef = useRef(0);
  const lipTargetRef = useRef(0);

  useEffect(() => {
    lipTargetRef.current = speaking ? 1 : 0;
  }, [speaking]);

  const init = useCallback(async () => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);

    const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.3, 2.2);

    const dir = new THREE.DirectionalLight(0xffffff, Math.PI);
    dir.position.set(1, 1, 1).normalize();
    scene.add(dir);
    const amb = new THREE.AmbientLight(0x404040, Math.PI * 1.4);
    scene.add(amb);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.05, 0);
    controls.enableDamping = true;
    controls.update();

    let animId = 0;
    const clock = new THREE.Clock();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    const updateLip = (delta: number) => {
      const vrm = vrmRef.current as THREE_VRM.VRM | null;
      if (vrm && (vrm as any).expressionManager) {
        lipValueRef.current += (lipTargetRef.current - lipValueRef.current) * (delta * 15);
        (vrm as any).expressionManager.setValue("A", lipValueRef.current);
      }
    };

    const loop = () => {
      const d = clock.getDelta();
      if (vrmRef.current) vrmRef.current.update(d);
      updateLip(d);
      controls.update();
      renderer.render(scene, camera);
      animId = requestAnimationFrame(loop);
    };

    // Load VRM
    const loader = new GLTFLoader();
    // Register VRM loader plugin (required in three-vrm v2)
    loader.register((parser: any) => new (THREE_VRM as any).VRMLoaderPlugin(parser));
    const url = "/ananya.vrm"; // put ananya.vrm in public/ folder
    try {
      const gltf: any = await loader.loadAsync(url);
      THREE_VRM.VRMUtils.removeUnnecessaryJoints(gltf.scene);
      const vrm: THREE_VRM.VRM = gltf.userData.vrm;
      vrmRef.current = vrm;
      scene.add(vrm.scene);
      setReady(true);
    } catch (e) {
      console.warn("VRM load failed. Place 'ananya.vrm' in public/.", e);
    }

    loop();

    cleanupRef.current = () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      renderer.dispose();
      vrmRef.current = null;
    };
  }, []);

  useEffect(() => {
    init();
    return () => cleanupRef.current?.();
  }, [init]);

  return (
    <div ref={containerRef} className={"relative w-full h-[560px] rounded-xl border bg-card/40 " + (className ?? "") }>
      <canvas ref={canvasRef} className="size-full rounded-xl" />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">
          Add ananya.vrm to public/ to see the avatar.
        </div>
      )}
    </div>
  );
};

export default VRMViewer;
