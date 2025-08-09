// web/static/js/main.js
import * as THREE from 'https://cdn.skypack.dev/three@0.149.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.149.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.149.0/examples/jsm/controls/OrbitControls.js';
import * as THREE_VRM from 'https://cdn.skypack.dev/@pixiv/three-vrm@2.0.7';

class AnanyaViewer {
    constructor() {
        this.vrm = null;
        this.clock = new THREE.Clock();
        this.lipSyncValue = 0;
        this.lipSyncTarget = 0;
        
        this.initScene();
        this.loadModel();
        this.animate = this.animate.bind(this); // Bind animate to the class instance
        this.animate();

        window.addEventListener("message", (event) => {
            if (event.data.type === "ananya_state_update") {
                this.handleStateUpdate(event.data.payload);
            }
        });
    }

    initScene() {
        this.scene = new THREE.Scene();
        const canvas = document.getElementById('vrm-canvas');
        if (!canvas) {
            console.error("VRM Canvas not found in the DOM!");
            return;
        }
        const container = document.getElementById('vrm-container');
        
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        this.camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.camera.position.set(0, 1.3, 2.2);

        const light = new THREE.DirectionalLight(0xffffff, Math.PI);
        light.position.set(1, 1, 1).normalize();
        this.scene.add(light);
        const ambient = new THREE.AmbientLight(0x404040, Math.PI * 1.5);
        this.scene.add(ambient);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 1.05, 0);
        this.controls.update();

        window.addEventListener('resize', () => {
            this.camera.aspect = container.clientWidth / container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    loadModel() {
        console.log('Starting VRM model load...');
        const loader = new GLTFLoader();
        
        // --- THIS IS THE CORRECTED PATH LOGIC ---
        // Gradio serves static files from a '/file=' path.
        // We construct the full URL to the file.
        const modelUrl = new URL('/file=static/vrm/ananya.vrm', window.location.href).href;
        console.log(`Attempting to load VRM from: ${modelUrl}`);
        
        loader.load(modelUrl, 
            (gltf) => {
                THREE_VRM.VRMUtils.removeUnnecessaryJoints(gltf.scene);
                THREE_VRM.VRM.from(gltf).then((vrm) => {
                    this.vrm = vrm;
                    this.scene.add(vrm.scene);
                    console.log('✅ Ananya VRM model loaded and added to scene!');
                });
            },
            (progress) => {
                const percent = (progress.loaded / progress.total * 100).toFixed(1);
                console.log(`Loading VRM model... ${percent}%`);
            },
            (error) => {
                console.error("❌ Failed to load VRM model. Check the following:\n1. Is 'ananya.vrm' present in 'web/static/vrm/'?\n2. Are there any errors in the browser's Network tab?\nError details:", error);
            }
        );
    }

    handleStateUpdate(payload) {
        if (!this.vrm) return;
        const { state } = payload;
        this.lipSyncTarget = (state === 'speaking') ? 1.0 : 0.0;
    }

    updateLipSync(delta) {
        if (this.vrm && this.vrm.expressionManager) {
            this.lipSyncValue += (this.lipSyncTarget - this.lipSyncValue) * (delta * 15.0);
            this.vrm.expressionManager.setValue('A', this.lipSyncValue);
        }
    }

    animate() {
        requestAnimationFrame(this.animate);
        const delta = this.clock.getDelta();
        
        if (this.vrm) {
            this.vrm.update(delta);
        }
        
        // Update lip sync regardless of vrm update, to ensure it closes
        this.updateLipSync(delta);
        
        if(this.renderer && this.camera) {
           this.renderer.render(this.scene, this.camera);
        }
    }
}

// Initialize VRM viewer when the Gradio app is fully mounted and ready
// We listen for the 'gradio:loaded' event on the document body
document.body.addEventListener('gradio:loaded', () => {
    console.log('Gradio has loaded, initializing VRM viewer...');
    new AnanyaViewer();
});