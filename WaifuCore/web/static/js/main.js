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
        this.animate();

        window.addEventListener("message", (event) => {
            if (event.data.type === "ananya_state_update") {
                this.handleStateUpdate(event.data.payload);
            }
        });
    }

    initScene() {
        this.scene = new THREE.Scene();
        
        // Wait for canvas to be available
        const waitForCanvas = () => {
            const canvas = document.getElementById('vrm-canvas');
            if (!canvas) {
                console.log('Waiting for VRM canvas...');
                setTimeout(waitForCanvas, 100);
                return;
            }
            
            console.log('Canvas element found:', canvas);
            console.log('Canvas dimensions:', canvas.clientWidth, 'x', canvas.clientHeight);
            
            this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
            
            // Set proper canvas size
            const container = document.getElementById('vrm-container');
            const width = container ? container.clientWidth : 600;
            const height = container ? container.clientHeight : 600;
            
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            
            this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
            this.camera.position.set(0, 1.2, 2.5);

            const light = new THREE.DirectionalLight(0xffffff);
            light.position.set(1, 1, 1).normalize();
            this.scene.add(light);
            const ambient = new THREE.AmbientLight(0x404040, 2);
            this.scene.add(ambient);

            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.target.set(0, 1.0, 0);
            this.controls.update();
            
            // Handle window resize
            window.addEventListener('resize', () => {
                const newWidth = container ? container.clientWidth : 600;
                const newHeight = container ? container.clientHeight : 600;
                this.camera.aspect = newWidth / newHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(newWidth, newHeight);
            });
        };
        
        waitForCanvas();
    }

    loadModel() {
        console.log('Starting VRM model load...');
        const loader = new GLTFLoader();
        
        // List of paths to try
        const vrmPaths = [
            '/file/static/vrm/ananya.vrm',  // Gradio file serving path
            'static/vrm/ananya.vrm',        // Direct static path
            './static/vrm/ananya.vrm',      // Relative path
            '/static/vrm/ananya.vrm'        // Absolute static path
        ];
        
        const tryLoadVRM = (pathIndex = 0) => {
            if (pathIndex >= vrmPaths.length) {
                console.error('All VRM loading paths failed');
                return;
            }
            
            const currentPath = vrmPaths[pathIndex];
            console.log(`Trying to load VRM from: ${currentPath}`);
            
            loader.load(currentPath, 
                (gltf) => {
                    console.log('GLTF loaded successfully:', gltf);
                    THREE_VRM.VRMUtils.removeUnnecessaryJoints(gltf.scene);
                    THREE_VRM.VRM.from(gltf).then((vrm) => {
                        this.vrm = vrm;
                        this.scene.add(vrm.scene);
                        console.log('Ananya VRM model loaded and added to scene!');
                    }).catch((vrmError) => {
                        console.error('VRM parsing error:', vrmError);
                        tryLoadVRM(pathIndex + 1);
                    });
                },
                (progress) => {
                    const percent = (progress.loaded / progress.total * 100).toFixed(1);
                    console.log(`Loading VRM model from ${currentPath}... ${percent}%`);
                },
                (error) => {
                    console.error(`Failed to load VRM from ${currentPath}:`, error);
                    tryLoadVRM(pathIndex + 1);
                }
            );
        };
        
        tryLoadVRM();
    }

    handleStateUpdate(payload) {
        if (!this.vrm) return;
        const { state, animation } = payload;
        this.lipSyncTarget = (state === 'speaking') ? 1.0 : 0.0;
    }

    updateLipSync(delta) {
        if (this.vrm && this.vrm.expressionManager) {
            this.lipSyncValue += (this.lipSyncTarget - this.lipSyncValue) * (delta * 15.0);
            this.vrm.expressionManager.setValue('A', this.lipSyncValue);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();
        
        if (this.vrm) {
            this.vrm.update(delta);
            this.updateLipSync(delta);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize VRM viewer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded, initializing VRM viewer...');
    new AnanyaViewer();
});

// Fallback for Gradio dynamic loading
window.addEventListener('load', () => {
    setTimeout(() => {
        const canvas = document.getElementById('vrm-canvas');
        if (!canvas) {
            console.log('Canvas not found on load, retrying...');
            new AnanyaViewer();
        }
    }, 1000);
});

// Additional fallback for message origin issues
window.addEventListener('message', (event) => {
    // Filter out cross-origin messages that aren't ours
    if (event.origin !== window.location.origin && 
        event.data.type !== 'ananya_state_update') {
        return; // Ignore cross-origin messages
    }
});