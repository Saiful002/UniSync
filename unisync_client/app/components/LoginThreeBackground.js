"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function LoginThreeBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 25);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const galaxyGroup = new THREE.Group();
    scene.add(galaxyGroup);

    // -------------------------------------------------------------
    // 1. Galaxy Twinkling Stars Field (Full Screen)
    // -------------------------------------------------------------
    const starCount = 500;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starScales = new Float32Array(starCount);

    const colorEmerald = new THREE.Color(0x34d399);
    const colorBrightGreen = new THREE.Color(0x6adb6a);
    const colorWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < starCount; i++) {
      // Random coordinates across full screen backdrop
      starPositions[i * 3] = (Math.random() - 0.5) * 80;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      // Color variation
      const randColor = Math.random();
      let c = colorWhite;
      if (randColor > 0.6) c = colorEmerald;
      else if (randColor > 0.3) c = colorBrightGreen;

      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;

      starScales[i] = 0.2 + Math.random() * 0.4;
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const starPoints = new THREE.Points(starGeometry, starMaterial);
    galaxyGroup.add(starPoints);

    // -------------------------------------------------------------
    // 2. Galaxy Spiral Dust Arms
    // -------------------------------------------------------------
    const spiralCount = 350;
    const spiralPositions = new Float32Array(spiralCount * 3);

    for (let i = 0; i < spiralCount; i++) {
      const radius = Math.random() * 25;
      const spinAngle = radius * 0.4;
      const branchAngle = ((i % 3) * 2 * Math.PI) / 3;

      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;

      spiralPositions[i * 3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      spiralPositions[i * 3 + 1] = randomY * 2;
      spiralPositions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
    }

    const spiralGeometry = new THREE.BufferGeometry();
    spiralGeometry.setAttribute("position", new THREE.BufferAttribute(spiralPositions, 3));

    const spiralMaterial = new THREE.PointsMaterial({
      size: 0.25,
      color: 0x10b981,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });

    const spiralPoints = new THREE.Points(spiralGeometry, spiralMaterial);
    spiralPoints.rotation.x = Math.PI / 4;
    galaxyGroup.add(spiralPoints);

    // -------------------------------------------------------------
    // Animation Loop: Galaxy Blinking & Rotation
    // -------------------------------------------------------------
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous Galaxy Rotation
      galaxyGroup.rotation.y = elapsedTime * 0.04;
      spiralPoints.rotation.z = elapsedTime * 0.02;

      // Pulsating / Blinking Stars Effect
      starMaterial.opacity = 0.65 + Math.sin(elapsedTime * 3) * 0.25;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      starGeometry.dispose();
      starMaterial.dispose();
      spiralGeometry.dispose();
      spiralMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
    />
  );
}
