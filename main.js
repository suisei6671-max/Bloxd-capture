import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

let scene, camera, renderer;
const loader = new GLTFLoader();

init();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

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
    preserveDrawingBuffer: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  addLights();
  animate();
}

function addLights() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(5, 10, 5);
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
    
      // ===== BoundingSphere を使う =====
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const sphere = box.getBoundingSphere(new THREE.Sphere());
    
      // 中央寄せ
      model.position.sub(center);
    
      // ===== 正方形キャプチャ前提 =====
      const SIZE = 512;
      renderer.setSize(SIZE, SIZE, false);
    
      camera.aspect = 1; // ← ★最重要
      camera.updateProjectionMatrix();
    
      // ===== 縦横両対応の距離計算 =====
      const fovY = THREE.MathUtils.degToRad(camera.fov);
      const fovX = 2 * Math.atan(Math.tan(fovY / 2) * camera.aspect);
    
      const distanceY = sphere.radius / Math.tan(fovY / 2);
      const distanceX = sphere.radius / Math.tan(fovX / 2);
    
      const distance = Math.max(distanceX, distanceY) * 1.25;
    
      // ===== 少し斜め上から =====
      camera.position.set(
        distance * 0.6,
        distance * 0.6,
        distance
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

