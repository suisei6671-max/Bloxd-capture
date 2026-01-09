import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/loaders/GLTFLoader.js';

const renderer = new THREE.WebGLRenderer({ alpha: true, preserveDrawingBuffer: true });
renderer.setSize(512, 512);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
camera.position.set(2, 2, 2);
camera.lookAt(0, 0, 0);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const loader = new GLTFLoader();

document.getElementById('fileInput').addEventListener('change', async (event) => {
  const files = Array.from(event.target.files);
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const gltf = await new Promise((resolve, reject) => {
      loader.parse(arrayBuffer, '', resolve, reject);
    });

    const model = gltf.scene;
    scene.add(model);

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    renderer.render(scene, camera);

    const dataURL = renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = file.name.replace(/\.glb$/, '') + '.png';
    link.click();

    scene.remove(model);
  }
});
