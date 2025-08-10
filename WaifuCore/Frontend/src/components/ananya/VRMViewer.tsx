import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { VRM, VRMExpressionPresetName, VRMLoaderPlugin, VRMHumanBoneName } from "@pixiv/three-vrm";

const retargetAnimation = (fbxAnimation: THREE.Group, vrm: VRM): THREE.AnimationClip => {
    const clip = fbxAnimation.animations[0];
    if (!clip) { return new THREE.AnimationClip("empty", 0, []); }
    const tracks: THREE.KeyframeTrack[] = [];
    const vrmSkeleton = vrm.humanoid.humanBones;
    const mixamoPrefix = 'mixamorig';
    const boneNameMap: { [key: string]: VRMHumanBoneName } = {
        Hips: 'hips', Spine: 'spine', Spine1: 'chest', Spine2: 'upperChest', Neck: 'neck', Head: 'head',
        LeftShoulder: 'leftShoulder', LeftArm: 'leftUpperArm', LeftForeArm: 'leftLowerArm', LeftHand: 'leftHand',
        RightShoulder: 'rightShoulder', RightArm: 'rightUpperArm', RightForeArm: 'rightLowerArm', RightHand: 'rightHand',
        LeftUpLeg: 'leftUpperLeg', LeftLeg: 'leftLowerLeg', LeftFoot: 'leftFoot', LeftToeBase: 'leftToes',
        RightUpLeg: 'rightUpperLeg', RightLeg: 'rightLowerLeg', RightFoot: 'rightFoot', RightToeBase: 'rightToes',
    };
    clip.tracks.forEach(track => {
        const trackNameParts = track.name.split('.');
        const mixamoBoneName = trackNameParts[0].replace(mixamoPrefix, '');
        const vrmBoneName = boneNameMap[mixamoBoneName];
        if (vrmBoneName) {
            const vrmNode = vrmSkeleton[vrmBoneName]?.node;
            if (vrmNode) {
                const newTrackName = `${vrmNode.name}.${trackNameParts[1]}`;
                const newTrack = track.clone();
                newTrack.name = newTrackName;
                tracks.push(newTrack);
            }
        }
    });
    return new THREE.AnimationClip(clip.name, clip.duration, tracks);
};

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
    const fbxLoader = new FBXLoader();
    
    Promise.all([
      gltfLoader.loadAsync("/ananya.vrm"),
      fbxLoader.loadAsync("/dance.fbx").catch(() => null),
      fbxLoader.loadAsync("/shy.fbx").catch(() => null),
    ]).then(([gltf, danceAnim, shyAnim]) => {
      const vrm = gltf.userData.vrm;
      vrmRef.current = vrm;
      scene.add(vrm.scene);
      const mixer = new THREE.AnimationMixer(vrm.scene);
      mixerRef.current = mixer;
      if (danceAnim) {
        const clip = retargetAnimation(danceAnim, vrm);
        animationActions.current['dance'] = mixer.clipAction(clip);
        animationActions.current['dance'].setLoop(THREE.LoopRepeat, Infinity);
      }
      if (shyAnim) {
        const clip = retargetAnimation(shyAnim, vrm);
        animationActions.current['shy'] = mixer.clipAction(clip);
        animationActions.current['shy'].setLoop(THREE.LoopOnce, 1);
        animationActions.current['shy'].clampWhenFinished = true;
      }
      setReady(true);
      animate();
    }).catch(e => {
        console.error("Asset loading failed:", e);
        setLoadingError("Failed to load assets. Check console.");
    });

    // --- ANTI-BLUR FIX: This logic is now fully restored ---
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
    onResize(); // Set initial size

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
        const lipTarget = currentState.characterState === 'speaking' ? 1.0 : 0.0;
        lipValue = THREE.MathUtils.lerp(lipValue, lipTarget, 1 - Math.exp(-25 * delta));
        manager?.setValue(VRMExpressionPresetName.Aa, lipValue);

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
        
        const hips = vrm.humanoid.getBoneNode(VRMHumanBoneName.Hips);
        if (hips) hips.position.y = 0.005 * Math.sin(clock.getElapsedTime() * 0.7);
        if (currentState.actionAnimation === 'laugh') {
            if (hips) hips.position.y += 0.02 * Math.sin(clock.getElapsedTime() * 20);
        }
        
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
    if (!mixer || !Object.keys(animationActions.current).length) return;
    Object.values(animationActions.current).forEach(action => action.fadeOut(0.5));
    if (actionAnimation && animationActions.current[actionAnimation]) {
      const action = animationActions.current[actionAnimation];
      action.reset().fadeIn(0.5).play();
    }
  }, [actionAnimation]);

  return (
    <div ref={containerRef} className={`relative w-full h-[560px] rounded-xl border bg-card/40 ${className ?? ""}`}>
      <canvas ref={canvasRef} className="size-full rounded-xl cursor-grab active:cursor-grabbing" />
      {!ready && (<div className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">{loadingError || "Loading Ananya's avatar..."}</div>)}
    </div>
  );
};

export default VRMViewer;