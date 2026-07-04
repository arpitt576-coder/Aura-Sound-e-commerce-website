/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { hotspots } from '../data';
import { Hotspot } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Rotate3d, Compass, Info, Sliders, Eye } from 'lucide-react';

interface HeadphoneShowcase3DProps {
  selectedColorHex: string;
  isExploded: boolean;
  onExplodedToggle: (val: boolean) => void;
  activeHotspotId: string | null;
  setActiveHotspotId: (id: string | null) => void;
}

export const HeadphoneShowcase3D: React.FC<HeadphoneShowcase3DProps> = ({
  selectedColorHex,
  isExploded,
  onExplodedToggle,
  activeHotspotId,
  setActiveHotspotId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Keep references to 3D parts we need to animate (for colors and exploded offsets)
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const leftEarcupGroupRef = useRef<THREE.Group | null>(null);
  const rightEarcupGroupRef = useRef<THREE.Group | null>(null);
  const leftEarpadMeshRef = useRef<THREE.Mesh | null>(null);
  const rightEarpadMeshRef = useRef<THREE.Mesh | null>(null);
  const leftYokeMeshRef = useRef<THREE.Mesh | null>(null);
  const rightYokeMeshRef = useRef<THREE.Mesh | null>(null);
  const headbandCushionMeshRef = useRef<THREE.Mesh | null>(null);

  // Materials list to update colors
  const coloredMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // Coordinates for rendering 2D HTML hotspots overlay
  const [projectedHotspots, setProjectedHotspots] = useState<{
    id: string;
    x: number;
    y: number;
    visible: boolean;
  }[]>([]);

  // Drag interaction state
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationVelocity = useRef({ x: 0.005, y: 0.002 }); // initial rotation
  const targetRotation = useRef({ x: 0.2, y: -0.4 });
  const currentRotation = useRef({ x: 0.2, y: -0.4 });

  // Exploded view animation state
  const explosionFactor = useRef(0);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // --- 1. Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = null; // transparent background to blend with our UI

    // --- 2. Camera Setup ---
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    camera.position.set(0, 0, 7);

    // --- 3. Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // --- 4. Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(5, 5, 5);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight2.position.set(-5, 3, -2);
    scene.add(dirLight2);

    const pointLightAccent = new THREE.PointLight(0xd97706, 3.0, 10);
    pointLightAccent.position.set(0, -1, 3);
    scene.add(pointLightAccent);

    // --- 5. Constructing the Procedural Headphone Model ---
    const headphoneGroup = new THREE.Group();
    modelGroupRef.current = headphoneGroup;

    // Materials definitions
    const matteBodyMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(selectedColorHex),
      roughness: 0.35,
      metalness: 0.7,
    });
    coloredMaterialsRef.current = [matteBodyMaterial];

    const metalChrormeMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.1,
      metalness: 0.95,
    });

    const cushionMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      metalness: 0.05,
    });

    const driverGrilleMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.9,
    });

    const goldCoreMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.3,
      metalness: 0.95,
    });

    // A. Headband Arch (Torus)
    const headbandGeo = new THREE.TorusGeometry(1.4, 0.09, 16, 100, Math.PI);
    const headbandMesh = new THREE.Mesh(headbandGeo, matteBodyMaterial);
    headbandMesh.position.y = 0.5;
    headbandMesh.rotation.x = 0;
    headphoneGroup.add(headbandMesh);

    // B. Headband Inner Cushion
    const headbandCushionGeo = new THREE.TorusGeometry(1.36, 0.08, 12, 100, Math.PI * 0.92);
    const headbandCushionMesh = new THREE.Mesh(headbandCushionGeo, cushionMaterial);
    headbandCushionMesh.position.y = 0.48;
    headbandCushionMesh.rotation.z = Math.PI * 0.04; // center it
    headphoneGroup.add(headbandCushionMesh);
    headbandCushionMeshRef.current = headbandCushionMesh;

    // C. Telescopic sliders & Hinge Pivots
    // Left slider housing
    const sliderLHousingGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.3, 16);
    const sliderLHousing = new THREE.Mesh(sliderLHousingGeo, matteBodyMaterial);
    sliderLHousing.position.set(-1.4, 0.5, 0);
    sliderLHousing.rotation.z = Math.PI / 12;
    headphoneGroup.add(sliderLHousing);

    // Right slider housing
    const sliderRHousing = sliderLHousing.clone();
    sliderRHousing.position.x = 1.4;
    sliderRHousing.rotation.z = -Math.PI / 12;
    headphoneGroup.add(sliderRHousing);

    // Left Slider Extension rods (Chrorme metal)
    const rodGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.7, 16);
    const rodL = new THREE.Mesh(rodGeo, metalChrormeMaterial);
    rodL.position.set(-1.48, 0.25, 0);
    rodL.rotation.z = Math.PI / 10;
    headphoneGroup.add(rodL);

    const rodR = rodL.clone();
    rodR.position.x = 1.48;
    rodR.rotation.z = -Math.PI / 10;
    headphoneGroup.add(rodR);

    // --- Left Ear Cup Assembly ---
    const leftCupGroup = new THREE.Group();
    leftCupGroup.position.set(-1.6, -0.3, 0);
    leftEarcupGroupRef.current = leftCupGroup;

    // Outer shell earcup (Squashed Cylinder)
    const earcupGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.32, 32);
    const leftEarcupMesh = new THREE.Mesh(earcupGeo, matteBodyMaterial);
    leftEarcupMesh.rotation.z = Math.PI / 2;
    leftEarcupMesh.scale.set(1.15, 1.0, 1.35); // Ergonomic shape
    leftCupGroup.add(leftEarcupMesh);

    // Outer Pivot Hanger Yoke
    const yokeGeo = new THREE.TorusGeometry(0.68, 0.05, 12, 48, Math.PI);
    const leftYokeMesh = new THREE.Mesh(yokeGeo, metalChrormeMaterial);
    leftYokeMesh.position.set(0.1, 0, 0);
    leftYokeMesh.rotation.z = -Math.PI / 2;
    leftCupGroup.add(leftYokeMesh);
    leftYokeMeshRef.current = leftYokeMesh;

    // Outer accent glass cover
    const accentGlassGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.04, 32);
    const leftGlassMesh = new THREE.Mesh(accentGlassGeo, driverGrilleMaterial);
    leftGlassMesh.position.x = -0.17;
    leftGlassMesh.rotation.z = Math.PI / 2;
    leftCupGroup.add(leftGlassMesh);

    // Left Internal Earpad
    const earpadGeo = new THREE.CylinderGeometry(0.64, 0.64, 0.25, 32);
    const leftEarpadMesh = new THREE.Mesh(earpadGeo, cushionMaterial);
    leftEarpadMesh.position.x = 0.18;
    leftEarpadMesh.rotation.z = Math.PI / 2;
    leftEarpadMesh.scale.set(1.2, 1.0, 1.4);
    leftCupGroup.add(leftEarpadMesh);
    leftEarpadMeshRef.current = leftEarpadMesh;

    // Left Internal Beryllium Dynamic Driver core (Visible ONLY in exploded blueprint view)
    const driverCoreGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 24);
    const driverCoreMesh = new THREE.Mesh(driverCoreGeo, goldCoreMaterial);
    driverCoreMesh.position.x = 0.04;
    driverCoreMesh.rotation.z = Math.PI / 2;
    leftCupGroup.add(driverCoreMesh);

    headphoneGroup.add(leftCupGroup);

    // --- Right Ear Cup Assembly ---
    const rightCupGroup = new THREE.Group();
    rightCupGroup.position.set(1.6, -0.3, 0);
    rightEarcupGroupRef.current = rightCupGroup;

    // Outer shell earcup
    const rightEarcupMesh = new THREE.Mesh(earcupGeo, matteBodyMaterial);
    rightEarcupMesh.rotation.z = -Math.PI / 2;
    rightEarcupMesh.scale.set(1.15, 1.0, 1.35);
    rightCupGroup.add(rightEarcupMesh);

    // Outer Pivot Hanger Yoke
    const rightYokeMesh = new THREE.Mesh(yokeGeo, metalChrormeMaterial);
    rightYokeMesh.position.set(-0.1, 0, 0);
    rightYokeMesh.rotation.z = Math.PI / 2;
    rightCupGroup.add(rightYokeMesh);
    rightYokeMeshRef.current = rightYokeMesh;

    // Outer accent glass cover
    const rightGlassMesh = new THREE.Mesh(accentGlassGeo, driverGrilleMaterial);
    rightGlassMesh.position.x = 0.17;
    rightGlassMesh.rotation.z = -Math.PI / 2;
    rightCupGroup.add(rightGlassMesh);

    // Right Internal Earpad
    const rightEarpadMesh = new THREE.Mesh(earpadGeo, cushionMaterial);
    rightEarpadMesh.position.x = -0.18;
    rightEarpadMesh.rotation.z = -Math.PI / 2;
    rightEarpadMesh.scale.set(1.2, 1.0, 1.4);
    rightCupGroup.add(rightEarpadMesh);
    rightEarpadMeshRef.current = rightEarpadMesh;

    // Right Internal Beryllium Dynamic Driver core
    const rightDriverCoreMesh = new THREE.Mesh(driverCoreGeo, goldCoreMaterial);
    rightDriverCoreMesh.position.x = -0.04;
    rightDriverCoreMesh.rotation.z = -Math.PI / 2;
    rightCupGroup.add(rightDriverCoreMesh);

    headphoneGroup.add(rightCupGroup);

    // Scale entire headphone group for balanced composition
    headphoneGroup.scale.set(1.2, 1.2, 1.2);
    scene.add(headphoneGroup);

    // --- 6. Window Resize Handler ---
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- 7. Animation Loop ---
    let animationFrameId: number;
    const tempV = new THREE.Vector3();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // A. Smoothly update exploded view transformations
      const targetExploded = isExploded ? 1.0 : 0.0;
      explosionFactor.current += (targetExploded - explosionFactor.current) * 0.12;

      if (leftCupGroup && rightCupGroup) {
        // Expand/contract entire cup groups
        leftCupGroup.position.x = -1.6 - (explosionFactor.current * 0.95);
        rightCupGroup.position.x = 1.6 + (explosionFactor.current * 0.95);

        // Expand further earpads and yokes relative to cups
        if (leftEarpadMeshRef.current && rightEarpadMeshRef.current) {
          leftEarpadMeshRef.current.position.x = 0.18 + (explosionFactor.current * 0.45);
          rightEarpadMeshRef.current.position.x = -0.18 - (explosionFactor.current * 0.45);
        }

        if (leftYokeMeshRef.current && rightYokeMeshRef.current) {
          leftYokeMeshRef.current.position.x = 0.1 - (explosionFactor.current * 0.25);
          rightYokeMeshRef.current.position.x = -0.1 + (explosionFactor.current * 0.25);
        }
      }

      if (headbandCushionMeshRef.current) {
        headbandCushionMeshRef.current.position.y = 0.48 - (explosionFactor.current * 0.15);
      }

      // B. Smooth Drag Rotation / Inertia
      if (!isDragging.current) {
        // Gentle auto-rotation
        targetRotation.current.y += rotationVelocity.current.y;
        targetRotation.current.x = Math.max(-0.4, Math.min(0.4, targetRotation.current.x + rotationVelocity.current.x));

        // Fade back to slow standard rotation when not dragging
        rotationVelocity.current.y += (0.003 - rotationVelocity.current.y) * 0.05;
        rotationVelocity.current.x += (0.0 - rotationVelocity.current.x) * 0.05;
      }

      // Damping camera or model rotation
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;

      headphoneGroup.rotation.x = currentRotation.current.x;
      headphoneGroup.rotation.y = currentRotation.current.y;

      // C. Project 3D Hotspot Coordinates into 2D DOM coordinates
      const coords = hotspots.map((spot) => {
        tempV.set(spot.position[0], spot.position[1], spot.position[2]);

        // Transform spot location relative to headphone model rotation and offset
        tempV.applyMatrix4(headphoneGroup.matrixWorld);

        // Check distance to project properly
        tempV.project(camera);

        const x = (tempV.x * 0.5 + 0.5) * containerRef.current!.clientWidth;
        const y = (1.0 - (tempV.y * 0.5 + 0.5)) * containerRef.current!.clientHeight;

        // If z coordinate in NDC is > 1, it's behind the clipping plane
        // Also if we want to hide spots facing completely away from the camera:
        // We calculate normal of hotspots or simply check absolute Z depth in camera space
        const spotCameraSpace = new THREE.Vector3(spot.position[0], spot.position[1], spot.position[2])
          .applyMatrix4(headphoneGroup.matrixWorld)
          .applyMatrix4(camera.matrixWorldInverse);

        // Simple occlusion rule: if Z is too close to camera or rotated away
        const isBehind = tempV.z > 1.0;

        return {
          id: spot.id,
          x,
          y,
          visible: !isBehind && spotCameraSpace.z < -0.1, // must be in front of camera
        };
      });

      setProjectedHotspots(coords);

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [isExploded]);

  // Handle color change dynamically
  useEffect(() => {
    coloredMaterialsRef.current.forEach((material) => {
      // Smooth color transition
      material.color.set(selectedColorHex);
    });
  }, [selectedColorHex]);

  // Focus camera/rotate on active hotspot select
  useEffect(() => {
    if (activeHotspotId) {
      const spot = hotspots.find((s) => s.id === activeHotspotId);
      if (spot) {
        // Calculate appropriate rotation targets to reveal this hotspot
        if (spot.id === 'headband') {
          targetRotation.current.x = 0.15;
          targetRotation.current.y = -0.1;
        } else if (spot.id === 'hinge') {
          targetRotation.current.x = -0.05;
          targetRotation.current.y = 0.5;
        } else if (spot.id === 'touch') {
          targetRotation.current.x = -0.15;
          targetRotation.current.y = -0.6;
        } else if (spot.id === 'driver') {
          targetRotation.current.x = 0.0;
          targetRotation.current.y = -0.8;
          // Trigger exploded view automatically to show beryllium drivers
          if (!isExploded) {
            onExplodedToggle(true);
          }
        }
      }
    }
  }, [activeHotspotId]);

  // --- Interaction Event Listeners ---
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;

    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    targetRotation.current.y += deltaX * 0.007;
    targetRotation.current.x = Math.max(-0.6, Math.min(0.6, targetRotation.current.x + deltaY * 0.007));

    // Calculate drag velocity for smooth inertia
    rotationVelocity.current = {
      x: deltaY * 0.001,
      y: deltaX * 0.001,
    };

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  // Mobile Touch Support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      previousMousePosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.current.y;

    targetRotation.current.y += deltaX * 0.008;
    targetRotation.current.x = Math.max(-0.6, Math.min(0.6, targetRotation.current.x + deltaY * 0.008));

    rotationVelocity.current = {
      x: deltaY * 0.001,
      y: deltaX * 0.001,
    };

    previousMousePosition.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  return (
    <div
      ref={containerRef}
      id="3d-canvas-container"
      className="relative w-full h-[350px] md:h-[500px] select-none cursor-grab active:cursor-grabbing bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-inner overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUpOrLeave}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating Instructions */}
      <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
        <span className="flex items-center gap-1 text-xs font-mono font-medium text-white/50 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10 shadow-md">
          <Rotate3d className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
          Drag to Orbit
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExplodedToggle(!isExploded);
          }}
          className={`pointer-events-auto flex items-center gap-1.5 text-xs font-mono font-medium px-3 py-1.5 rounded-full border shadow-md transition-all ${
            isExploded
              ? 'bg-indigo-600 text-white border-indigo-500'
              : 'bg-black/60 text-white border-white/10 hover:bg-white/10'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          {isExploded ? 'Assembled View' : 'Exploded View'}
        </button>
      </div>

      {/* Interactive 3D projected HTML Hotspots overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {projectedHotspots.map((spot) => {
          const originalSpot = hotspots.find((s) => s.id === spot.id);
          if (!spot.visible || !originalSpot) return null;

          const isActive = activeHotspotId === spot.id;

          return (
            <div
              key={spot.id}
              style={{
                position: 'absolute',
                left: `${spot.x}px`,
                top: `${spot.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-10 pointer-events-auto"
            >
              {/* Outer pulsing ring */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHotspotId(isActive ? null : spot.id);
                }}
                className="group relative flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white font-mono text-xs border-2 border-white shadow-md focus:outline-hidden hover:scale-110 transition-transform"
              >
                <span className="absolute -inset-1.5 rounded-full border border-indigo-500/40 animate-ping opacity-75" />
                <span className="relative text-[10px] font-bold">
                  {hotspots.indexOf(originalSpot) + 1}
                </span>

                {/* Micro tooltip hover preview */}
                <span className="absolute hidden group-hover:block bottom-9 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[10px] font-mono px-2 py-1 rounded-md whitespace-nowrap tracking-wider shadow-md border border-white/10">
                  {originalSpot.title}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating Active Hotspot Info Overlay Panel */}
      <AnimatePresence>
        {activeHotspotId && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 inset-x-4 md:right-4 md:left-auto md:w-80 bg-black/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-xl pointer-events-auto text-white"
          >
            {(() => {
              const spot = hotspots.find((s) => s.id === activeHotspotId);
              if (!spot) return null;
              return (
                <div className="relative">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-mono font-semibold tracking-widest text-indigo-400 uppercase">
                      Engineering Spotlight 0{hotspots.indexOf(spot) + 1}
                    </span>
                    <button
                      onClick={() => setActiveHotspotId(null)}
                      className="text-white/40 hover:text-white text-xs font-mono font-bold px-1.5 py-0.5 rounded-sm hover:bg-white/10 transition-colors"
                    >
                      ✖
                    </button>
                  </div>
                  <h4 className="font-sans font-semibold text-sm text-white mb-1.5 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-indigo-400" />
                    {spot.title}
                  </h4>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {spot.description}
                  </p>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
