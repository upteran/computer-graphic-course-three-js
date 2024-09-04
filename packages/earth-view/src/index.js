import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Application state and elements
let app = {
  el: document.getElementById("app"), // Element where the renderer will be attached
  scene: null,
  renderer: null,
  camera: null,
  entity: {
    earth: null,
    moon: null,
  },
};

// Initialize the scene, camera, and renderer
const init = () => {
  app.renderer = new THREE.WebGLRenderer();
  app.renderer.setSize(window.innerWidth, window.innerHeight); // Set renderer size
  app.renderer.shadowMap.enabled = true; // Enable shadow maps
  app.el.appendChild(app.renderer.domElement); // Add renderer to the DOM

  app.scene = new THREE.Scene(); // Create a new scene

  app.camera = new THREE.PerspectiveCamera(
    65, // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.4, // Near clipping plane
    900 // Far clipping plane
  );

  // Create and configure a directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.4); // Create a white directional light
  directionalLight.position.set(50, 0, 30); // Set light position
  directionalLight.castShadow = true; // Enable shadows for the light
  app.scene.add(directionalLight);

  // Add ambient light for general illumination
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft white ambient light
  app.scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1, 100); // color, intensity, distance

  pointLight.position.set(10, 10, 10);

  app.scene.add(pointLight);

  pointLight.distance = 50; // The distance at which the light's intensity is 0
  pointLight.decay = 2; // How quickly the light diminishes
  pointLight.angle = Math.PI / 4; // The cone angle of the light
  pointLight.penumbra = 0.1; // Softness of the light's edge

  app.camera.position.z = 7; // Position the camera

  // Create and add the AxesHelper to the scene
  // const axesHelper = new THREE.AxesHelper(5); // AxesHelper for orientation
  // app.scene.add(axesHelper);

  // Load textures
  const textureLoader = new THREE.TextureLoader();
  const textureEarth = textureLoader.load(
    "https://upload.wikimedia.org/wikipedia/commons/c/cf/WorldMap-A_non-Frame.png"
  );
  const textureMoon = textureLoader.load(
    "https://upload.wikimedia.org/wikipedia/commons/d/db/Moonmap_from_clementine_data.png"
  );

  // Create a Earth sphere
  const geometryEarth = new THREE.SphereGeometry(1, 32, 32);
  const materialEarth = new THREE.MeshPhongMaterial({ map: textureEarth });
  const sphereEarth = new THREE.Mesh(geometryEarth, materialEarth);
  app.scene.add(sphereEarth);
  sphereEarth.receiveShadow = true;
  sphereEarth.castShadow = true;
  app.entity.earth = sphereEarth;
  sphereEarth.position.x = -1;

  // Create a Moon sphere
  const geometryMoon = new THREE.SphereGeometry(0.35, 32, 32);
  const materialMoon = new THREE.MeshPhongMaterial({ map: textureMoon });
  const sphereMoon = new THREE.Mesh(geometryMoon, materialMoon);
  app.scene.add(sphereMoon);
  sphereMoon.position.x = 1;
  sphereMoon.receiveShadow = true;
  sphereMoon.castShadow = true;
  app.entity.moon = sphereMoon;
};

let angle = 0;
let speed = 0.006;
let radius = 1.7;
let centerX = -1;
let centerZ = 0;

function updateOrbitalMoonMotion(obj) {
  // Update the angle
  angle += speed;

  // Calculate new position
  const x = centerX + radius * Math.cos(angle);
  const z = centerZ + radius * Math.sin(angle);

  // Set the object's position
  obj.position.set(x, obj.position.y, z);
}

// Rendering function
const render = () => {
  requestAnimationFrame(render); // Request the next frame
  app.renderer.render(app.scene, app.camera); // Render the scene from the camera's perspective
  app.entity.earth.rotation.y -= 0.003;
  app.entity.moon.rotation.y += 0.003;
  updateOrbitalMoonMotion(app.entity.moon);
};

init(); // Initialize the scene
render(); // Start the rendering loop

// Add OrbitControls for camera manipulation
// const controls = new OrbitControls(app.camera, app.renderer.domElement);

window.addEventListener("resize", (e) => {
  // Update the camera's aspect ratio
  app.camera.aspect = window.innerWidth / window.innerHeight;
  app.camera.updateProjectionMatrix();

  // Update the renderer's size
  app.renderer.setSize(window.innerWidth, window.innerHeight);

  // Optionally, update the CSS style of the canvas
  app.renderer.domElement.style.width = "100%";
  app.renderer.domElement.style.height = "100%";
});
