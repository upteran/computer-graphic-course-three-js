// Import Three.js and OrbitControls modules
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Create a new Three.js scene
let scene = new THREE.Scene();

// Set up the camera with a perspective view
let camera = new THREE.PerspectiveCamera(
  80, // Field of view
  innerWidth / innerHeight, // Aspect ratio
  0.1, // Near clipping plane
  100 // Far clipping plane
);
camera.position.set(1, 1.5, 1).setLength(2.5); // Position the camera
camera.lookAt(scene.position); // Look at the center of the scene

// Initialize the WebGL renderer
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight); // Set renderer size
renderer.setClearColor(0x161616); // Set background color
document.body.appendChild(renderer.domElement); // Add renderer to the DOM

// Set up orbit controls to allow user interaction
let controls = new OrbitControls(camera, renderer.domElement);

// Add lighting to the scene
let light = new THREE.DirectionalLight(0xffffff, 1); // Directional light
light.position.setScalar(1); // Light position
scene.add(light, new THREE.AmbientLight(0xffffff, 0.5)); // Ambient light

// Add grid and axes helper for reference
let grid = new THREE.GridHelper(2, 20, 0xffff00, 0xffff00); // GridHelper
grid.position.y = -0.001; // Position the grid slightly below the origin
scene.add(grid, new THREE.AxesHelper(1)); // Add axes helper

let graph; // Variable to hold the current graph mesh

// Function to create and update the graph based on the selected function
function createGraph(functionToGraph) {
  if (graph) {
    scene.remove(graph); // Remove previous graph if it exists
  }

  let graphGeom = new THREE.PlaneGeometry(2, 2, 20, 20); // Create a plane geometry
  graphGeom.rotateX(Math.PI * -0.5); // Rotate plane to lie flat
  let graphMat = new THREE.MeshNormalMaterial({
    side: THREE.DoubleSide, // Both sides of the mesh are visible
    wireframe: false, // Display as solid mesh
  });
  graph = new THREE.Mesh(graphGeom, graphMat); // Create a mesh with the geometry and material

  let pos = graphGeom.attributes.position; // Access the geometry's position attribute
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i); // Get x-coordinate of vertex
    let z = pos.getZ(i); // Get z-coordinate of vertex
    let y = functionToGraph(x, z); // Compute y-coordinate using the selected function
    pos.setY(i, y); // Set the computed y-coordinate
  }
  graphGeom.computeVertexNormals(); // Recompute normals for lighting
  scene.add(graph); // Add the updated graph to the scene
}

// Example functions for different graph types
function cone(x, z) {
  return Math.sqrt(x * x + z * z); // Cone equation
}

function hyperbolicParaboloid(x, z) {
  return x * x - z * z; // Hyperbolic Paraboloid equation
}

function saddle(x, z) {
  return x * z; // Saddle equation
}

function sinWave(x, z) {
  return Math.sin(x * Math.PI) * Math.cos(z * Math.PI); // Sine Wave equation
}

// Create the initial graph with the hyperbolic paraboloid function
createGraph(hyperbolicParaboloid);

// Add event listener to update graph when function selection changes
document
  .getElementById("functionSelector")
  .addEventListener("change", function (event) {
    let selectedFunction = event.target.value;
    switch (selectedFunction) {
      case "cone":
        createGraph(cone);
        break;
      case "hyperbolicParaboloid":
        createGraph(hyperbolicParaboloid);
        break;
      case "saddle":
        createGraph(saddle);
        break;
      case "sinWave":
        createGraph(sinWave);
        break;
      default:
        createGraph(hyperbolicParaboloid);
        break;
    }
  });

// Animation loop to continuously render the scene
function animate() {
  requestAnimationFrame(animate); // Request next frame
  controls.update(); // Update controls
  renderer.render(scene, camera); // Render the scene
}

animate(); // Start the animation loop

// Adjust camera and renderer on window resize
window.addEventListener("resize", onResize);

function onResize() {
  camera.aspect = innerWidth / innerHeight; // Update camera aspect ratio
  camera.updateProjectionMatrix(); // Update projection matrix
  renderer.setSize(innerWidth, innerHeight); // Update renderer size
}
