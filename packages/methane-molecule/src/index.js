import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Application state and elements
let app = {
  el: document.getElementById("app"), // Element where the renderer will be attached
  scene: null,
  renderer: null,
  camera: null,
};

// Parameters for vertices
const radius = 6; // Radius of the circular arrangement of spheres
const centerX = 0; // X-coordinate of the center
const centerY = -3; // Y-coordinate of the center
const centerZ = 0; // Z-coordinate of the center

// Angles for vertex placement
const angles = [0, 120, 240]; // Angles for placing vertices around the circle

// Function to create a cylinder between two points
function createCylinderBetweenPoints(point1, point2) {
  const direction = new THREE.Vector3().subVectors(point2, point1); // Compute the direction vector between the two points
  const length = direction.length(); // Compute the length of the cylinder
  const orientation = new THREE.Matrix4();

  // Orient the cylinder to point from point1 to point2
  orientation.lookAt(point1, point2, new THREE.Object3D().up);
  orientation.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));

  const cylinderGeometry = new THREE.CylinderGeometry(0.3, 0.3, length, 22); // Create a cylinder geometry
  const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0xfefefe }); // Create a material for the cylinder
  const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial); // Create a mesh for the cylinder

  cylinder.castShadow = true; // Enable the cylinder to cast shadows
  cylinder.receiveShadow = true; // Enable the cylinder to receive shadows

  cylinder.applyMatrix4(orientation); // Apply the orientation matrix
  cylinder.position.x = (+point1.x + +point2.x) / 2; // Position the cylinder at the midpoint
  cylinder.position.y = (+point1.y + +point2.y) / 2;
  cylinder.position.z = (+point1.z + +point2.z) / 2;
  return cylinder;
}

// Function to calculate vertex positions based on center, radius, and angle
function calculateVertex(centerX, centerY, centerZ, radius, angleDegrees) {
  const angleRadians = (angleDegrees * Math.PI) / 180; // Convert angle from degrees to radians
  const x = (centerX + radius * Math.cos(angleRadians)).toFixed(2);
  const z = (centerZ + radius * Math.sin(angleRadians)).toFixed(2);
  const y = centerY.toFixed(2);
  return { x, y, z };
}

// Function to create a sphere with specified position, color, and radius
const createSphere = ({ x, y, z } = { x: 1, y: 1, z: 1 }, color, r) => {
  const geometry = new THREE.SphereGeometry(r || 1, 32, 32); // Create the sphere geometry
  const material = new THREE.MeshPhongMaterial({
    // Create the material for the sphere
    color: color,
    wireframe: false,
    metalness: 0.5,
    roughness: 0.3,
  });
  const sphere = new THREE.Mesh(geometry, material); // Create the sphere mesh

  sphere.castShadow = true; // Enable the sphere to cast shadows
  sphere.receiveShadow = true; // Enable the sphere to receive shadows

  sphere.position.set(x, y, z); // Set the position of the sphere

  return sphere;
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
    0.1, // Near clipping plane
    900 // Far clipping plane
  );

  // Create and configure a directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 4); // Create a white directional light
  directionalLight.position.set(10, 20, 10); // Set light position
  directionalLight.castShadow = true; // Enable shadows for the light
  app.scene.add(directionalLight);

  // Configure shadow properties for better quality
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.left = -50;
  directionalLight.shadow.camera.right = 50;
  directionalLight.shadow.camera.top = 50;
  directionalLight.shadow.camera.bottom = -50;

  // Add ambient light for general illumination
  const ambientLight = new THREE.AmbientLight(0x404040, 4); // Soft white ambient light
  app.scene.add(ambientLight);

  app.camera.position.z = 30; // Position the camera

  // Create and add the AxesHelper to the scene
  const axesHelper = new THREE.AxesHelper(5); // AxesHelper for orientation
  app.scene.add(axesHelper);

  // Create a group to hold all objects that should be affected by rotation
  const group = new THREE.Group();
  app.scene.add(group);

  // Calculate vertices for positioning the spheres
  const vertex1 = calculateVertex(centerX, centerY, centerZ, radius, angles[0]);
  const vertex2 = calculateVertex(centerX, centerY, centerZ, radius, angles[1]);
  const vertex3 = calculateVertex(centerX, centerY, centerZ, radius, angles[2]);

  // Create spheres and add them to the group
  const sphere1 = createSphere({ x: 0, y: 0, z: 0 }, 0xaa2020, 2);
  const sphere2 = createSphere(
    { x: vertex1.x, y: vertex1.y, z: vertex1.z },
    0x0000aa
  );
  const sphere3 = createSphere(
    { x: vertex2.x, y: vertex2.y, z: vertex2.z },
    0x0000aa
  );
  const sphere4 = createSphere(
    { x: vertex3.x, y: vertex3.y, z: vertex3.z },
    0x0000aa
  );
  const sphere5 = createSphere({ x: 0, y: 6, z: 0 }, 0x0000aa);

  group.add(sphere1);
  group.add(sphere2);
  group.add(sphere3);
  group.add(sphere4);
  group.add(sphere5);

  // Create cylinders connecting the spheres and add them to the group
  const cylinder = createCylinderBetweenPoints(
    sphere1.position,
    sphere4.position
  );
  const cylinder2 = createCylinderBetweenPoints(
    sphere1.position,
    sphere3.position
  );
  const cylinder3 = createCylinderBetweenPoints(
    sphere1.position,
    sphere2.position
  );
  const cylinder4 = createCylinderBetweenPoints(
    sphere1.position,
    sphere5.position
  );

  group.add(cylinder);
  group.add(cylinder2);
  group.add(cylinder3);
  group.add(cylinder4);

  // Create and add the floor
  const floorGeometry = new THREE.PlaneGeometry(100, 100); // Large plane for the floor
  const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x73e873 }); // Green color for the floor
  const floor = new THREE.Mesh(floorGeometry, floorMaterial); // Create the floor mesh
  floor.rotation.x = -Math.PI / 2; // Rotate to make it horizontal
  floor.position.y = -7; // Position the floor below the objects
  floor.receiveShadow = true; // Enable the floor to receive shadows
  app.scene.add(floor);

  // Add OrbitControls for camera manipulation
  const controls = new OrbitControls(app.camera, app.renderer.domElement);

  // Handle keyboard input for moving the group
  document.addEventListener("keydown", (event) => {
    switch (event.keyCode) {
      case 38: // ArrowUp
        group.position.y += 0.1; // Move group up
        break;
      case 40: // ArrowDown
        group.position.y -= 0.1; // Move group down
        break;
      case 37: // ArrowLeft
        group.position.x -= 0.1; // Move group left
        break;
      case 39: // ArrowRight
        group.position.x += 0.1; // Move group right
        break;
    }
  });
};

// Rendering function
const render = () => {
  requestAnimationFrame(render); // Request the next frame
  app.renderer.render(app.scene, app.camera); // Render the scene from the camera's perspective
};

init(); // Initialize the scene
render(); // Start the rendering loop
