import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VRM, VRMExpressionPresetName, VRMLoaderPlugin, VRMHumanBoneName } from "@pixiv/three-vrm";

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
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const animationActions = useRef<Record<string, THREE.AnimationAction>>({});

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
    
    // Load VRM and create simple, reliable animations
    gltfLoader.loadAsync("/ananya.vrm").then((gltf) => {
      const vrm = gltf.userData.vrm;
      vrmRef.current = vrm;
      scene.add(vrm.scene);
      const mixer = new THREE.AnimationMixer(vrm.scene);
      mixerRef.current = mixer;
      
      console.log("VRM loaded successfully");
      console.log("VRM scene name:", vrm.scene.name);
      
      // 1. SPIN ANIMATION - Simple Y rotation
      const spinTrack = new THREE.NumberKeyframeTrack(
        vrm.scene.name + '.rotation[y]',
        [0, 2],
        [0, Math.PI * 2]
      );
      const spinClip = new THREE.AnimationClip('spin', 2, [spinTrack]);
      const spinAction = mixer.clipAction(spinClip);
      spinAction.setLoop(THREE.LoopRepeat, Infinity);
      animationActions.current['spin'] = spinAction;
      console.log("Spin animation created");
      
      // 2. DANCE ANIMATION - Simple up and down bouncing
      const dancePositionTrack = new THREE.VectorKeyframeTrack(
        vrm.scene.name + '.position',
        [0, 0.25, 0.5, 0.75, 1.0],
        [
          0, 0, 0,    // start
          0, 0.15, 0, // bounce up
          0, 0, 0,    // down
          0, 0.15, 0, // bounce up
          0, 0, 0     // down
        ]
      );
      const danceClip = new THREE.AnimationClip('dance', 1, [dancePositionTrack]);
      const danceAction = mixer.clipAction(danceClip);
      danceAction.setLoop(THREE.LoopRepeat, Infinity);
      animationActions.current['dance'] = danceAction;
      console.log("Dance animation created - simple bouncing");
      
      // 3. SHY ANIMATION - Only facial expressions
      const shyTrack = new THREE.NumberKeyframeTrack(
        vrm.scene.name + '.userData.shyTrigger',
        [0, 3],
        [0, 1]
      );
      const shyClip = new THREE.AnimationClip('shy', 3, [shyTrack]);
      const shyAction = mixer.clipAction(shyClip);
      shyAction.setLoop(THREE.LoopOnce, 1);
      shyAction.clampWhenFinished = true;
      
      // Override shy action play to trigger facial expressions
      const originalShyPlay = shyAction.play.bind(shyAction);
      shyAction.play = function() {
        if (vrm.expressionManager) {
          console.log("Triggering shy facial expressions");
          
          // Clear current expressions
          Object.values(VRMExpressionPresetName).forEach(preset => {
            if (typeof preset === 'string') {
              vrm.expressionManager?.setValue(preset, 0);
            }
          });
          
          // Set shy/blushing expressions
          vrm.expressionManager.setValue(VRMExpressionPresetName.Happy, 0.9);
          vrm.expressionManager.setValue(VRMExpressionPresetName.Blink, 0.7);
          
          // Reset expressions after 2.5 seconds
          setTimeout(() => {
            if (vrm.expressionManager) {
              Object.values(VRMExpressionPresetName).forEach(preset => {
                if (typeof preset === 'string') {
                  vrm.expressionManager?.setValue(preset, 0);
                }
              });
              vrm.expressionManager.setValue(VRMExpressionPresetName.Neutral, 1);
            }
          }, 2500);
        }
        return originalShyPlay();
      };
      
      animationActions.current['shy'] = shyAction;
      console.log("Shy animation created - facial expressions only");
      
      // 4. WAVE ANIMATION - Placeholder
      const waveTrack = new THREE.NumberKeyframeTrack(
        vrm.scene.name + '.userData.waveTrigger',
        [0, 2.5],
        [0, 1]
      );
      const waveClip = new THREE.AnimationClip('wave', 2.5, [waveTrack]);
      const waveAction = mixer.clipAction(waveClip);
      waveAction.setLoop(THREE.LoopOnce, 1);
      waveAction.clampWhenFinished = true;
      animationActions.current['wave'] = waveAction;
      console.log("Wave animation created");
      
      console.log("All animations created:", Object.keys(animationActions.current));
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
        
        // Lip sync
        const lipTarget = currentState.characterState === 'speaking' ? 1.0 : 0.0;
        lipValue = THREE.MathUtils.lerp(lipValue, lipTarget, 1 - Math.exp(-25 * delta));
        manager?.setValue(VRMExpressionPresetName.Aa, lipValue);

        // Emotions
        const emotionMap = {
            happy: { [VRMExpressionPresetName.Happy]: 1.0, [VRMExpressionPresetName.Relaxed]: 0.7 },
            sad: { [VRMExpressionPresetName.Sad]: 1.0 },
            angry: { [VRMExpressionPresetName.Angry]: 1.0 },
            shy: { [VRMExpressionPresetName.Happy]: 0.3, [VRMExpressionPresetName.Blink]: 1.0 },
            neutral: { [VRMExpressionPresetName.Neutral]: 1.0 }
        };
        const targetExpression = emotionMap[currentState.emotion as keyof typeof emotionMap] || emotionMap.neutral;
        Object.values(VRMExpressionPresetName).forEach(preset => {
            if (typeof preset !== 'string') return;
            const targetWeight = targetExpression[preset as VRMExpressionPresetName] || 0;
            const currentWeight = manager?.getValue(preset) ?? 0;
            const newWeight = THREE.MathUtils.lerp(currentWeight, targetWeight, 1 - Math.exp(-12 * delta));
            manager?.setValue(preset, newWeight);
        });
        
        // Breathing animation (only when idle)
        if (!currentState.actionAnimation || currentState.actionAnimation === 'idle') {
          const hips = vrm.humanoid.getBoneNode(VRMHumanBoneName.Hips);
          if (hips) {
            hips.position.y = 0.005 * Math.sin(clock.getElapsedTime() * 0.7);
          }
        }
        
        // Laugh animation
        if (currentState.actionAnimation === 'laugh') {
          const hips = vrm.humanoid.getBoneNode(VRMHumanBoneName.Hips);
          if (hips) {
            hips.position.y += 0.02 * Math.sin(clock.getElapsedTime() * 20);
          }
        }
        
        // Blinking
        blinkCountdown -= delta;
        if (blinkCountdown < 0) {
            manager?.setValue(VRMExpressionPresetName.Blink, 1.0);
            blinkCountdown = Math.random() * 4 + 1.5;
        } else {
            const currentBlink = manager?.getValue(VRMExpressionPresetName.Blink) ?? 0;
            if (currentBlink > 0) manager?.setValue(VRMExpressionPresetName.Blink, Math.max(0, currentBlink - delta * 10.0));
        }
        
        vrm.lookAt.target = eyeTarget;
        mixerRef.current?.update(delta);
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

  useEffect(() => {
    const mixer = mixerRef.current;
    if (!mixer || !Object.keys(animationActions.current).length) {
      console.log("Animation effect - mixer or actions not ready");
      return;
    }
    
    console.log("=== ANIMATION REQUESTED ===");
    console.log("Requested animation:", actionAnimation);
    console.log("Available actions:", Object.keys(animationActions.current));
    
    // Stop all current animations
    Object.values(animationActions.current).forEach(action => {
      if (action.isRunning()) {
        console.log("Stopping animation:", action.getClip().name);
        action.stop();
      }
    });
    
    // Start requested animation
    if (actionAnimation && animationActions.current[actionAnimation]) {
      const action = animationActions.current[actionAnimation];
      console.log("Starting animation:", actionAnimation);
      console.log("Animation details:", {
        name: action.getClip().name,
        duration: action.getClip().duration,
        tracks: action.getClip().tracks.length
      });
      
      action.reset();
      action.play();
      
      console.log("Animation started successfully. IsRunning:", action.isRunning());
    } else if (actionAnimation) {
      console.warn("Animation not found:", actionAnimation);
    } else {
      console.log("No animation requested");
    }
  }, [actionAnimation]);

  return (
    <div ref={containerRef} className={`relative w-full h-[500px] md:h-[600px] lg:h-[650px] rounded-xl border bg-card/40 shadow-lg ${className ?? ""}`}>
      <canvas ref={canvasRef} className="size-full rounded-xl cursor-grab active:cursor-grabbing" />
      
      {/* 360° View Label */}
      <div className="absolute top-4 left-4 bg-gradient-to-r from-pink-500/90 to-purple-600/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>360° Interactive View</span>
        </div>
      </div>
      
      {/* Instructions Overlay */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs opacity-70 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <span>🖱️ Drag to rotate • 🔍 Scroll to zoom</span>
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
