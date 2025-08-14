import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VRM, VRMExpressionPresetName, VRMLoaderPlugin } from "@pixiv/three-vrm";

interface VRMViewerProps {
  characterState: "idle" | "thinking" | "speaking";
  emotion: string;
  actionAnimation?: string | null;
  className?: string;
}

const VRMViewer: React.FC<VRMViewerProps> = ({ characterState, emotion, actionAnimation, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const stateRef = useRef({ characterState, emotion, actionAnimation });
  const vrmRef = useRef<VRM | null>(null);
  const spinningRef = useRef(true); // Start spinning by default

  useEffect(() => {
    stateRef.current = { characterState, emotion, actionAnimation };
  }, [characterState, emotion, actionAnimation]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.3, 2.0);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.05, 0);
    controls.enableDamping = true;
    const light = new THREE.DirectionalLight(0xffffff, Math.PI);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040, Math.PI * 1.5));
    const eyeTarget = new THREE.Object3D();
    scene.add(eyeTarget);

    const gltfLoader = new GLTFLoader();
    gltfLoader.register((parser) => new VRMLoaderPlugin(parser));
    
    // Load VRM and focus on facial expressions only
    gltfLoader.loadAsync("/ananya.vrm").then((gltf) => {
      const vrm = gltf.userData.vrm;
      vrmRef.current = vrm;
      scene.add(vrm.scene);
      
      console.log("VRM loaded successfully - facial expressions only mode");
      setReady(true);
    }).catch(e => {
        console.error("VRM loading failed:", e);
        setLoadingError("Failed to load VRM avatar. Check console for details.");
    });

    const onResize = () => {
        if (!containerRef.current || !canvasRef.current) return;
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);
    onResize();

    const onMouseMove = (event: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        eyeTarget.position.set(x * 0.5, 1.2 + y * 0.2, 0.7);
    };
    container.addEventListener("mousemove", onMouseMove);

    let lipValue = 0;
    let blinkCountdown = Math.random() * 5 + 2;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const vrm = vrmRef.current;
      
      if (vrm) {
        const currentState = stateRef.current;
        const manager = vrm.expressionManager;
        
        // Enhanced lip sync with more realistic mouth movements
        const lipTarget = currentState.characterState === 'speaking' ? 1.0 : 0.0;
        lipValue = THREE.MathUtils.lerp(lipValue, lipTarget, 1 - Math.exp(-25 * delta));
        
        // Multiple mouth shapes for more realistic speech
        if (currentState.characterState === 'speaking') {
          // Simulate different mouth shapes during speech
          const time = clock.getElapsedTime();
          const mouthVariation = Math.sin(time * 15) * 0.3 + 0.7; // Varies between 0.4 and 1.0
          manager?.setValue(VRMExpressionPresetName.Aa, lipValue * mouthVariation);
          manager?.setValue(VRMExpressionPresetName.Ih, lipValue * (1 - mouthVariation) * 0.5);
          manager?.setValue(VRMExpressionPresetName.Ou, lipValue * Math.sin(time * 8) * 0.3);
        } else {
          // Close mouth when not speaking
          manager?.setValue(VRMExpressionPresetName.Aa, 0);
          manager?.setValue(VRMExpressionPresetName.Ih, 0);
          manager?.setValue(VRMExpressionPresetName.Ou, 0);
        }

        // Enhanced emotion mapping with more nuanced expressions
        type ExpressionWeights = Partial<Record<VRMExpressionPresetName, number>>;
        const emotionMap: Record<string, ExpressionWeights> = {
            happy: { 
              [VRMExpressionPresetName.Happy]: 1.0, 
              [VRMExpressionPresetName.Relaxed]: 0.7,
              [VRMExpressionPresetName.LookUp]: 0.3
            },
            sad: { 
              [VRMExpressionPresetName.Sad]: 1.0,
              [VRMExpressionPresetName.LookDown]: 0.5
            },
            angry: { 
              [VRMExpressionPresetName.Angry]: 1.0,
              [VRMExpressionPresetName.Surprised]: 0.3
            },
            shy: { 
              [VRMExpressionPresetName.Happy]: 0.4, 
              [VRMExpressionPresetName.Blink]: 0.8,
              [VRMExpressionPresetName.LookDown]: 0.6
            },
            thinking: {
              [VRMExpressionPresetName.LookUp]: 0.7,
              [VRMExpressionPresetName.Neutral]: 0.5
            },
            neutral: { 
              [VRMExpressionPresetName.Neutral]: 1.0 
            }
        };
        
        const targetExpression: ExpressionWeights = emotionMap[currentState.emotion] || emotionMap.neutral;
        console.log("Setting emotion:", currentState.emotion, "Target expression:", targetExpression);
        Object.values(VRMExpressionPresetName).forEach(preset => {
            if (typeof preset !== 'string') return;
            const targetWeight = targetExpression[preset as VRMExpressionPresetName] ?? 0;
            const currentWeight = manager?.getValue(preset) ?? 0;
            const newWeight = THREE.MathUtils.lerp(currentWeight, targetWeight, 1 - Math.exp(-12 * delta));
            if (targetWeight > 0) {
              console.log(`Setting ${preset} to ${newWeight}`);
            }
            manager?.setValue(preset, newWeight);
        });
        
        // Enhanced blinking with more natural timing
        blinkCountdown -= delta;
        if (blinkCountdown < 0) {
            const blinkDuration = 0.15; // Quick blink
            manager?.setValue(VRMExpressionPresetName.Blink, 1.0);
            
            setTimeout(() => {
              manager?.setValue(VRMExpressionPresetName.Blink, 0);
            }, blinkDuration * 1000);
            
            blinkCountdown = Math.random() * 3 + 1.5; // More frequent blinking
        }
        
        // Continuous spinning animation
        if (spinningRef.current && vrm.scene) {
          vrm.scene.rotation.y += delta * 1.5; // Spin speed: 1.5 radians per second
        }
        
        if (vrm.lookAt) {
          vrm.lookAt.target = eyeTarget;
        }
        vrm.update(delta);
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener("mousemove", onMouseMove);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Handle spinning animation control
  useEffect(() => {
    if (actionAnimation === 'stop-spin') {
      console.log("Stopping spin");
      spinningRef.current = false;
      
      // Reset rotation to face forward when stopping
      const vrm = vrmRef.current;
      if (vrm && vrm.scene) {
        vrm.scene.rotation.y = 0;
      }
    }
    // Note: Other emotions don't affect spinning state, only stop-spin does
  }, [actionAnimation]);

  return (
    <div ref={containerRef} className={`relative w-full h-[500px] md:h-[600px] lg:h-[650px] rounded-xl border bg-card/40 shadow-lg ${className ?? ""}`}>
      <canvas ref={canvasRef} className="size-full rounded-xl cursor-grab active:cursor-grabbing" />
      
      {/* Facial Expression Focus Label */}
      <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500/90 to-purple-600/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>Facial Expressions & Lip Sync</span>
        </div>
      </div>
      
      {/* Instructions Overlay */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs opacity-70 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <span>� Watch mouth movements • � Emotion changes</span>
        </div>
      </div>
      
      {!ready && (
        <div className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">
          {loadingError || "Loading Ananya's avatar..."}
        </div>
      )}
    </div>
  );
};

export default VRMViewer;
