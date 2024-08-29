# Physics Playground with Cannon.js and Three.js

This project is a physics-based simulation using **Cannon.js** for physics and **Three.js** for 3D rendering. The scene features dynamic object creation, interaction, and real-time physics simulation, all while emphasizing performance optimizations like sleep schedules for inactive objects.

**DEMO:** [physics-demo-cannon-three-js.vercel.app](http://physics-demo-cannon-three-js.vercel.app/)


## Features

- **Dynamic Object Creation**: Create spheres and cubes in the 3D scene with random sizes and positions using a GUI.
- **Real-time Physics Simulation**: Physics simulation is handled by Cannon.js, enabling realistic collision detection, gravity, and object interactions.
- **Performance Optimization**: The physics engine utilizes sleep schedules for non-active objects to improve performance, reducing unnecessary calculations.
- **Sound Effects**: Collision sounds are triggered based on the impact strength of objects, adding an audio dimension to the simulation.
- **Interactive Controls**: Users can manipulate the camera view using OrbitControls, allowing for an immersive exploration of the 3D scene.

## Object Creation and Management

### Spheres and Cubes

Objects are dynamically created in the scene through the GUI. You can:

- **Create Spheres**: Spheres are generated with random radii and positions.
- **Create Cubes**: Cubes are spawned with set dimensions and random positions, stacked vertically with each new cube.
- **Reset Objects**: All non-static objects can be removed from the scene, resetting the simulation.

## Physics World

The physics simulation is powered by Cannon.js:

- **Gravity**: Standard Earth gravity is applied to all dynamic objects.
- **Collision Detection**: Objects interact realistically, with collisions triggering sound effects based on impact strength.
- **Sleep Scheduling**: Inactive objects are put to sleep by the physics engine to optimize performance, ensuring only active objects consume computational resources.

## How to Use

- **Create Objects**: Use the GUI to add spheres and cubes to the scene.
- **Explore**: Use the mouse to navigate the scene with OrbitControls.
- **Reset**: Clear the scene of all dynamic objects and start fresh.

## Screenshot
![Screenshot from 2024-08-29 16-33-35](https://github.com/user-attachments/assets/59692a26-aa89-4d7a-ac30-73e272587d07)
![Screenshot from 2024-08-29 16-31-29](https://github.com/user-attachments/assets/3f7b0fd2-879e-49e5-8c1f-7b24662afbab)
![Screenshot from 2024-08-29 16-31-02](https://github.com/user-attachments/assets/f562f296-5479-4239-b5dd-cec9a8ef49f6)
