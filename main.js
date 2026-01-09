import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

let scene, camera, renderer;
const loader = new GLTFLoader();

init();

function init() {
  scene = new THREE.Scene();
  scene.background = null;
  camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  // 視点固定
  camera.position.set(2, 2.5, 4);
  camera.lookAt(0, 1, 0);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,              // ★追加
    preserveDrawingBuffer: true
  });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  addLights();
  animate();
}

function addLights() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));

  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(3, 5, 4);
  scene.add(dir);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

const fileInput = document.getElementById("file");

window.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("file");

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    
    loader.load(url, (gltf) => {
      scene.clear();
      addLights();
    
      const model = gltf.scene;
      scene.add(model);
    
      // ===== BoundingSphere =====
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const sphere = box.getBoundingSphere(new THREE.Sphere());
    
      model.position.sub(center);
    
      // ===== 正方形 & 透過 =====
      const SIZE = 512;
      renderer.setSize(SIZE, SIZE, false);
    
      camera.aspect = 1;
      camera.updateProjectionMatrix();
    
      // ===== カメラ距離 =====
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const distance = sphere.radius / Math.tan(fov / 2) * 1.3;
    
      // ===== Minecraft専用角度 =====
      const yaw = THREE.MathUtils.degToRad(45);   // 左右
      const pitch = THREE.MathUtils.degToRad(35); // 上下
    
      camera.position.set(
        Math.sin(yaw) * Math.cos(pitch) * distance,
        Math.sin(pitch) * distance,
        Math.cos(yaw) * Math.cos(pitch) * distance
      );
    
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    
      setTimeout(takeScreenshot, 100);
    });

  });
});

function takeScreenshot() {
  const dataURL = renderer.domElement.toDataURL("image/png");

  const a = document.createElement("a");
  a.href = dataURL;
  a.download = "gltf_screenshot.png";
  a.click();
}

