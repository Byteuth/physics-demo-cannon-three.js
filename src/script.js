import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import * as CANNON from "cannon-es";

const gui = new GUI();

// Debug
const debugObject = {};
debugObject.createSphere = () => {
	createSphere(Math.random() * 0.5, {
		x: (Math.random() - 0.5) * 3,
		y: 3,
		z: (Math.random() - 0.5) * 3,
	});
};
let previousCubePosition = 0.5;
let newValue = previousCubePosition;
debugObject.createCube = () => {
	createCube(1, 1, 1, {
		x: (Math.random() - 0.5) * 1,
		y: previousCubePosition + 1,
		z: (Math.random() - 0.5) * 1,
	});

	previousCubePosition = newValue;
	newValue += 1;
};

debugObject.reset = () => {
	for (const object of objectsToUpdate) {
		if (object.isStatic) continue;

		object.body.removeEventListener("collide", playContactSound);
		physicsWorld.removeBody(object.body);
		scene.remove(object.mesh);
	}

	previousCubePosition = 0;
	newValue = 1;

	console.log("reset");
};

gui.add(debugObject, "createSphere");
gui.add(debugObject, "createCube");
gui.add(debugObject, "reset");

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Sounds
const contactSound = new Audio("/sounds/hit.mp3");
let canPlaySound = true;
const cooldownTime = 500;

const playContactSound = (collision) => {
	const impactStrength = collision.contact.getImpactVelocityAlongNormal();
	if (impactStrength > 1.5) {
		const minImpact = 1.5;
		const maxImpact = 12;
		let volume = (impactStrength - minImpact) / (maxImpact - minImpact);

		volume = Math.min(Math.max(volume, 0), 1);

		contactSound.volume = volume;
		contactSound.currentTime = 0;
		contactSound.play();
		canPlaySound = false;
		setTimeout(() => {
			canPlaySound = true;
		}, cooldownTime);
	}
};

// Textures
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
	"/textures/environmentMaps/0/px.png",
	"/textures/environmentMaps/0/nx.png",
	"/textures/environmentMaps/0/py.png",
	"/textures/environmentMaps/0/ny.png",
	"/textures/environmentMaps/0/pz.png",
	"/textures/environmentMaps/0/nz.png",
]);

const physicsWorld = new CANNON.World();
physicsWorld.gravity.set(0, -9.82, 0);
physicsWorld.broadphase = new CANNON.SAPBroadphase(physicsWorld);
physicsWorld.allowSleep = true;

const defaultMaterial = new CANNON.Material("default");

const defaultContactMaterial = new CANNON.ContactMaterial(
	defaultMaterial,
	defaultMaterial,
	{
		friction: 0.1,
		restitution: 0.7,
	}
);
physicsWorld.addContactMaterial(defaultContactMaterial);

const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
	mass: 0,
	shape: floorShape,
	material: defaultMaterial,
});
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
physicsWorld.addBody(floorBody);

const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(10, 10),
	new THREE.MeshStandardMaterial({
		color: "#777777",
		metalness: 0.3,
		roughness: 0.4,
		envMap: environmentMapTexture,
		envMapIntensity: 0.5,
	})
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100
);
camera.position.set(-6, 6, 6);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Utils
const objectsToUpdate = [];

const sphereGeo = new THREE.SphereGeometry(1, 20, 20);
const sphereMat = new THREE.MeshStandardMaterial({
	metalness: 0.3,
	roughness: 0.4,
	envMap: environmentMapTexture,
});

const createSphere = (radius, position) => {
	const mesh = new THREE.Mesh(sphereGeo, sphereMat);
	mesh.scale.set(radius, radius, radius);
	mesh.castShadow = true;
	mesh.position.copy(position);
	scene.add(mesh);

	const shape = new CANNON.Sphere(radius);
	const body = new CANNON.Body({
		mass: 1,
		shape: shape,
		position: new CANNON.Vec3(0, 3, 0),
		material: defaultMaterial,
	});
	body.position.copy(position);
	body.addEventListener("collide", playContactSound);
	physicsWorld.addBody(body);

	objectsToUpdate.push({
		mesh: mesh,
		body: body,
	});
};
createSphere(0.5, { x: 0, y: 3, z: 0 });

const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
const cubeMat = new THREE.MeshStandardMaterial({
	metalness: 0.3,
	roughness: 0.4,
	envMap: environmentMapTexture,
	wireframe: false,
});

const createCube = (width, height, depth, position) => {
	const mesh = new THREE.Mesh(cubeGeo, cubeMat);
	mesh.scale.set(width, height, depth);
	mesh.castShadow = true;
	mesh.position.copy(position);
	scene.add(mesh);

	const shape = new CANNON.Box(
		new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)
	);
	const body = new CANNON.Body({
		mass: 1,
		shape: shape,
		position: new CANNON.Vec3(0, 3, 0),
		material: defaultMaterial,
	});
	body.position.copy(position);
	body.addEventListener("collide", playContactSound);
	physicsWorld.addBody(body);

	objectsToUpdate.push({
		mesh: mesh,
		body: body,
	});
};

const createBoundingArea = () => {
	const rectangleGeometry = new THREE.BoxGeometry(10.5, 0.5, 0.5);
	const rectangleMaterial = new THREE.MeshStandardMaterial({
		metalness: 0.3,
		roughness: 0.4,
	});

	const createWall = (position, rotation) => {
		const mesh = new THREE.Mesh(rectangleGeometry, rectangleMaterial);
		mesh.position.copy(position);
		if (rotation) {
			mesh.rotation.y = rotation;
		}

		const shape = new CANNON.Box(new CANNON.Vec3(10.5 / 2, 0.5 / 2, 0.5 / 2));
		const body = new CANNON.Body({
			mass: 0,
			shape: shape,
			position: new CANNON.Vec3(position.x, position.y, position.z),
			material: defaultMaterial,
		});

		if (rotation) {
			const quat = new CANNON.Quaternion();
			quat.setFromEuler(0, rotation, 0, "XYZ");
			body.quaternion.copy(quat);
		}
		physicsWorld.addBody(body);

		objectsToUpdate.push({
			mesh: mesh,
			body: body,
			isStatic: true,
		});

		scene.add(mesh);
	};

	createWall(new THREE.Vector3(0, 0.25, -5), 0);
	createWall(new THREE.Vector3(0, 0.25, 5), 0);
	createWall(new THREE.Vector3(-5, 0.25, 0), Math.PI / 2);
	createWall(new THREE.Vector3(5, 0.25, 0), Math.PI / 2);
};

createBoundingArea();
// Animate
const clock = new THREE.Clock();
let oldElapsedTime = 0;

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - oldElapsedTime;
	oldElapsedTime = elapsedTime;

	// Update objects
	for (const object of objectsToUpdate) {
		object.mesh.position.copy(object.body.position);
		object.mesh.quaternion.copy(object.body.quaternion);
	}

	// Update physics world
	physicsWorld.step(1 / 60, deltaTime, 3);

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
