import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WineType } from '../types/wine';
import { getWineColors } from '../utils/cellarStats';

interface ThreeBottleViewProps {
  type: WineType;
  name: string;
  vintage?: number | null;
  winery?: string;
  photoUrl?: string;
  interactive?: boolean;
  height?: number | string;
}

export function ThreeBottleView({
  type,
  name,
  vintage,
  winery,
  photoUrl,
  interactive = true,
  height = 360
}: ThreeBottleViewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    bottleGroup?: THREE.Group;
    animFrameId?: number;
  }>({});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const h = typeof height === 'number' ? height : container.clientHeight || 360;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / h, 0.1, 100);
    camera.position.set(0, 0.2, 4.2);

    // 2. Renderer with soft shadow & sRGB output
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffecd2, 2.5);
    dirLight1.position.set(3, 4, 3);
    scene.add(dirLight1);

    const rimLight = new THREE.DirectionalLight(0xd4af37, 1.8);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x722f37, 1.5, 8);
    fillLight.position.set(0, -1.5, 2);
    scene.add(fillLight);

    // 4. Bottle Group
    const bottleGroup = new THREE.Group();
    const colors = getWineColors(type);

    // Procedural Bottle Construction
    // Body (cylinder)
    const bodyRadius = 0.58;
    const bodyHeight = 1.6;
    const bodyGeom = new THREE.CylinderGeometry(bodyRadius, bodyRadius * 0.98, bodyHeight, 32);
    
    // Glass Material
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: colors.glassColor,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.88,
      reflectivity: 0.9,
      clearcoat: 0.8
    });
    const bodyMesh = new THREE.Mesh(bodyGeom, glassMat);
    bodyMesh.position.y = -0.15;
    bottleGroup.add(bodyMesh);

    // Wine liquid core inside bottle
    const wineGeom = new THREE.CylinderGeometry(bodyRadius * 0.92, bodyRadius * 0.9, bodyHeight * 0.92, 24);
    const wineMat = new THREE.MeshStandardMaterial({
      color: colors.wineColor,
      roughness: 0.2,
      metalness: 0.05,
      transparent: true,
      opacity: 0.95
    });
    const wineMesh = new THREE.Mesh(wineGeom, wineMat);
    wineMesh.position.y = -0.18;
    bottleGroup.add(wineMesh);

    // Shoulder (tapered cone)
    const shoulderHeight = 0.5;
    const neckRadius = 0.18;
    const shoulderGeom = new THREE.CylinderGeometry(neckRadius, bodyRadius, shoulderHeight, 32);
    const shoulderMesh = new THREE.Mesh(shoulderGeom, glassMat);
    shoulderMesh.position.y = 0.9;
    bottleGroup.add(shoulderMesh);

    // Neck
    const neckHeight = 0.85;
    const neckGeom = new THREE.CylinderGeometry(neckRadius, neckRadius, neckHeight, 32);
    const neckMesh = new THREE.Mesh(neckGeom, glassMat);
    neckMesh.position.y = 1.55;
    bottleGroup.add(neckMesh);

    // Lip ring
    const lipGeom = new THREE.TorusGeometry(neckRadius + 0.02, 0.035, 16, 32);
    lipGeom.rotateX(Math.PI / 2);
    const lipMesh = new THREE.Mesh(lipGeom, glassMat);
    lipMesh.position.y = 1.95;
    bottleGroup.add(lipMesh);

    // Foil Capsule
    const capsuleHeight = 0.6;
    const capsuleGeom = new THREE.CylinderGeometry(neckRadius + 0.015, neckRadius + 0.02, capsuleHeight, 32);
    const capsuleMat = new THREE.MeshStandardMaterial({
      color: colors.capsuleColor,
      roughness: 0.35,
      metalness: 0.7
    });
    const capsuleMesh = new THREE.Mesh(capsuleGeom, capsuleMat);
    capsuleMesh.position.y = 1.68;
    bottleGroup.add(capsuleMesh);

    // Texture for bottle label: real photo if provided, or elegant procedural parchment
    let labelTexture: THREE.Texture;
    if (photoUrl) {
      const loader = new THREE.TextureLoader();
      labelTexture = loader.load(photoUrl);
      labelTexture.colorSpace = THREE.SRGBColorSpace;
    } else {
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 512;
      labelCanvas.height = 384;
      const ctx = labelCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f8f4eb';
        ctx.fillRect(0, 0, 512, 384);

        ctx.strokeStyle = '#c5a059';
        ctx.lineWidth = 6;
        ctx.strokeRect(16, 16, 480, 352);
        ctx.lineWidth = 1.5;
        ctx.strokeRect(26, 26, 460, 332);

        ctx.fillStyle = '#632332';
        ctx.font = 'bold 22px serif';
        ctx.textAlign = 'center';
        ctx.fillText((winery || 'CANTINA').toUpperCase().slice(0, 28), 256, 75);

        ctx.fillStyle = '#1c1417';
        ctx.font = 'bold 30px serif';
        ctx.fillText(name.slice(0, 24), 256, 155);

        ctx.fillStyle = '#c5a059';
        ctx.font = '28px serif';
        ctx.fillText('❦ 🍷 ❦', 256, 215);

        ctx.fillStyle = '#555';
        ctx.font = 'italic 24px serif';
        ctx.fillText(`${vintage ? vintage : 'Cuvée Speciale'} — ${type}`, 256, 275);

        ctx.fillStyle = '#8b6f3c';
        ctx.font = '14px sans-serif';
        ctx.fillText('ENOTATI • DIARIO ENOLOGICO DI COPPIA', 256, 330);
      }
      labelTexture = new THREE.CanvasTexture(labelCanvas);
      labelTexture.colorSpace = THREE.SRGBColorSpace;
    }

    const labelMat = new THREE.MeshStandardMaterial({
      map: labelTexture,
      roughness: 0.5,
      metalness: 0.05
    });

    // Label cylinder curved mesh in front of bottle
    const labelGeom = new THREE.CylinderGeometry(
      bodyRadius + 0.005,
      bodyRadius + 0.005,
      0.95,
      32,
      1,
      true,
      -Math.PI * 0.45,
      Math.PI * 0.9
    );
    const labelMesh = new THREE.Mesh(labelGeom, labelMat);
    labelMesh.position.y = -0.15;
    bottleGroup.add(labelMesh);

    // Initial position
    bottleGroup.position.set(0, -0.2, 0);
    bottleGroup.rotation.y = 0.2;
    scene.add(bottleGroup);

    // Interaction / Drag Rotation
    let isDragging = false;
    let prevMouseX = 0;
    let autoRotate = true;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      isDragging = true;
      autoRotate = false;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      prevMouseX = clientX;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !interactive) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - prevMouseX;
      prevMouseX = clientX;
      bottleGroup.rotation.y += deltaX * 0.015;
    };

    const onPointerUp = () => {
      isDragging = false;
      // Resume gentle auto rotate after a pause
      setTimeout(() => {
        if (!isDragging) autoRotate = true;
      }, 2500);
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domElem.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = typeof height === 'number' ? height : container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animFrameId: number = 0;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      if (autoRotate) {
        bottleGroup.rotation.y += 0.008;
      }
      renderer.render(scene, camera);
    };
    animate();

    sceneRef.current = { renderer, scene, camera, bottleGroup, animFrameId };

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domElem.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      renderer.dispose();
      bodyGeom.dispose();
      wineGeom.dispose();
      shoulderGeom.dispose();
      neckGeom.dispose();
      lipGeom.dispose();
      capsuleGeom.dispose();
      labelGeom.dispose();
      labelTexture.dispose();
    };
  }, [type, name, vintage, winery, photoUrl, interactive, height]);

  return (
    <div className="relative w-full flex items-center justify-center">
      <div 
        ref={mountRef} 
        style={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height }}
        className="cursor-grab active:cursor-grabbing flex items-center justify-center"
      />
      {interactive && (
        <div className="absolute bottom-2 text-xs font-serif text-[#d4af37]/75 tracking-wider uppercase pointer-events-none bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs border border-[#d4af37]/20">
          Trascina per ruotare 3D
        </div>
      )}
    </div>
  );
}
