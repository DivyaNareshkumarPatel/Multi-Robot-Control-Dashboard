import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const Lidar3D = () => {
  const mountRef = useRef(null);

  // Generate LiDAR-like points for 2D objects in a room section (point cloud on a flat plane)
  const generate2DRoomPoints = (numPoints) => {
    const points = [];
    const roomWidth = 20;  // Smaller room width for part of a room
    const roomDepth = 20;  // Smaller depth for the floor/plane

    // Generate points to appear on a flat surface (XZ plane), with varying Y (height) for color
    for (let i = 0; i < numPoints; i++) {
      const x = Math.random() * roomWidth - roomWidth / 2; // X position (floor of the room)
      const z = Math.random() * roomDepth - roomDepth / 2; // Z position (floor of the room)
      const y = Math.random() * 5; // Simulating height for color intensity (but still flat)

      points.push({ x, y, z });
    }
    return points;
  };

  useEffect(() => {
    // Create a 3D scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Generate points for 2D-like objects in the room
    const roomPoints = generate2DRoomPoints(5000); // Denser cloud for room-like effect

    // Create geometry for point cloud
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(roomPoints.length * 3);
    const colors = new Float32Array(roomPoints.length * 3);

    roomPoints.forEach((point, index) => {
      positions[index * 3] = point.x; // X position
      positions[index * 3 + 1] = point.y; // Y position (height, for color intensity)
      positions[index * 3 + 2] = point.z; // Z position

      // Normalize height to get color intensity (using red, green, yellow)
      const intensity = Math.max(0, Math.min(1, point.y / 5)); // Normalize height from 0 to 5

      // Color intensity based on height (red, green, yellow)
      const red = Math.min(1, intensity * 1.5);   // Red for lower heights
      const green = Math.min(1, Math.max(0, (intensity - 0.3) * 2));  // Green for medium heights
      const yellow = Math.min(1, Math.max(0, intensity - 0.7) * 3); // Yellow for higher points

      colors[index * 3] = red;   // Red channel
      colors[index * 3 + 1] = green;  // Green channel
      colors[index * 3 + 2] = yellow; // Yellow channel
    });

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Create a material with vertex colors
    const material = new THREE.PointsMaterial({
      size: 0.1,  // Smaller point size to fit in the room
      vertexColors: true,
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // Set camera position to focus on the 2D-like objects
    camera.position.set(0, 5, 30); // Positioned above and looking at the points from a distance
    camera.lookAt(0, 0, 0);

    // Add orbit controls for camera interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;

    // Add ambient light for better visualization
    const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
    scene.add(ambientLight);

    // Render loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Update controls
      renderer.render(scene, camera);
    };

    animate();
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
};

export default Lidar3D;
