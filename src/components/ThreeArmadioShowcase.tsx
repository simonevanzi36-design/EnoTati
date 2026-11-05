import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { WineItem, WineType } from '../types/wine';
import { getWineColors, getProgressionMilestones } from '../utils/cellarStats';
import { Sparkles, Trophy, Eye, RotateCw, ZoomIn, Info, Plus, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ThreeArmadioShowcaseProps {
  wines: WineItem[];
  onSelectWine: (wine: WineItem) => void;
  onAddNewWine: () => void;
  onGoBack?: () => void;
  animatingWineId?: string | null;
  onAnimationComplete?: () => void;
}

export function ThreeArmadioShowcase({
  wines,
  onSelectWine,
  onAddNewWine,
  onGoBack,
  animatingWineId,
  onAnimationComplete
}: ThreeArmadioShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredWine, setHoveredWine] = useState<WineItem | null>(null);
  const [activeTypeHighlight, setActiveTypeHighlight] = useState<WineType | 'ALL'>('ALL');
  const [cameraView, setCameraView] = useState<'full' | 'shelfTop' | 'shelfBottom'>('full');

  // Stats & Progression
  const milestones = useMemo(() => getProgressionMilestones(wines.length), [wines.length]);

  // Keep refs for animation and Three scene
  const sceneStateRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    bottleMeshes: Map<string, THREE.Group>;
    animatingBottleGroup?: THREE.Group;
    raycaster?: THREE.Raycaster;
    mouse?: THREE.Vector2;
    animFrameId?: number;
    targetCameraPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    currentLookAt: THREE.Vector3;
  }>({
    bottleMeshes: new Map(),
    targetCameraPos: new THREE.Vector3(0, 0.4, 5.8),
    targetLookAt: new THREE.Vector3(0, 0.2, 0),
    currentLookAt: new THREE.Vector3(0, 0.2, 0)
  });

  // Switch camera presets with responsive mobile adjustments
  useEffect(() => {
    const isMobile = (containerRef.current?.clientWidth || window.innerWidth) < 640;
    const isTablet = (containerRef.current?.clientWidth || window.innerWidth) >= 640 && (containerRef.current?.clientWidth || window.innerWidth) < 1024;
    const fullZ = isMobile ? 8.4 : (isTablet ? 6.5 : 5.8);
    const shelfZ = isMobile ? 5.8 : (isTablet ? 4.8 : 4.0);

    if (cameraView === 'full') {
      sceneStateRef.current.targetCameraPos.set(0, isMobile ? 0.2 : 0.4, fullZ);
      sceneStateRef.current.targetLookAt.set(0, 0.2, 0);
    } else if (cameraView === 'shelfTop') {
      sceneStateRef.current.targetCameraPos.set(0, 1.4, shelfZ);
      sceneStateRef.current.targetLookAt.set(0, 1.3, 0);
    } else if (cameraView === 'shelfBottom') {
      sceneStateRef.current.targetCameraPos.set(0, -0.6, shelfZ);
      sceneStateRef.current.targetLookAt.set(0, -0.7, 0);
    }
  }, [cameraView]);

  // Build the Armadio 3D Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || Math.min(window.innerWidth - 32, 800);
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;
    const height = isMobile ? 380 : (isTablet ? 460 : 540);

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181014); // Warmer, more luminous cellar tone
    scene.fog = new THREE.FogExp2(0x181014, 0.05);

    const initialZ = isMobile ? 8.4 : (isTablet ? 6.5 : 5.8);
    const initialY = isMobile ? 0.2 : 0.4;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, initialY, initialZ);
    sceneStateRef.current.targetCameraPos.set(0, initialY, initialZ);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting with enhanced luminosity
    const ambient = new THREE.AmbientLight(0xfff3e5, 2.3);
    scene.add(ambient);

    const topCellarLight = new THREE.PointLight(0xffdfa8, 3.4, 14);
    topCellarLight.position.set(0, 3.0, 2.5);
    scene.add(topCellarLight);

    const goldAccentLight = new THREE.DirectionalLight(0xffe6a3, 2.2);
    goldAccentLight.position.set(-2, 3.5, 3.5);
    scene.add(goldAccentLight);

    const warmFill = new THREE.PointLight(0x8a2b3c, 1.8, 12);
    warmFill.position.set(2, -0.5, 2.5);
    scene.add(warmFill);

    // 4. Construct the Armadio (Grand Wine Cabinet)
    const cabinetGroup = new THREE.Group();

    // Wood Materials
    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x2b170e, // Rich dark walnut/oak
      roughness: 0.7,
      metalness: 0.1
    });

    const shelfWoodMat = new THREE.MeshStandardMaterial({
      color: 0x3d2315,
      roughness: 0.6,
      metalness: 0.15
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.35,
      metalness: 0.8
    });

    // Cabinet Back Wall
    const backWallGeom = new THREE.BoxGeometry(4.4, 3.8, 0.15);
    const backWall = new THREE.Mesh(backWallGeom, darkWoodMat);
    backWall.position.set(0, 0.3, -0.4);
    cabinetGroup.add(backWall);

    // Left and Right Side Pillars
    const sideGeom = new THREE.BoxGeometry(0.18, 3.8, 0.9);
    const leftSide = new THREE.Mesh(sideGeom, darkWoodMat);
    leftSide.position.set(-2.2, 0.3, 0);
    cabinetGroup.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeom, darkWoodMat);
    rightSide.position.set(2.2, 0.3, 0);
    cabinetGroup.add(rightSide);

    // Top Cornice / Arch
    const topCorniceGeom = new THREE.BoxGeometry(4.6, 0.22, 0.95);
    const topCornice = new THREE.Mesh(topCorniceGeom, darkWoodMat);
    topCornice.position.set(0, 2.2, 0);
    cabinetGroup.add(topCornice);

    // Gold brass header crest
    const crestGeom = new THREE.BoxGeometry(1.4, 0.08, 0.05);
    const crest = new THREE.Mesh(crestGeom, goldTrimMat);
    crest.position.set(0, 2.2, 0.48);
    cabinetGroup.add(crest);

    // Base plinth
    const baseGeom = new THREE.BoxGeometry(4.6, 0.25, 0.95);
    const baseMesh = new THREE.Mesh(baseGeom, darkWoodMat);
    baseMesh.position.set(0, -1.6, 0);
    cabinetGroup.add(baseMesh);

    // 3 Shelves (tiers)
    const shelfYPositions = [-1.45, -0.2, 1.05];
    const shelfGeom = new THREE.BoxGeometry(4.25, 0.1, 0.75);

    shelfYPositions.forEach((yPos, i) => {
      const shelf = new THREE.Mesh(shelfGeom, shelfWoodMat);
      shelf.position.set(0, yPos, 0);
      cabinetGroup.add(shelf);

      // Gold lip edge
      const lipGeom = new THREE.BoxGeometry(4.25, 0.04, 0.03);
      const lip = new THREE.Mesh(lipGeom, goldTrimMat);
      lip.position.set(0, yPos + 0.04, 0.38);
      cabinetGroup.add(lip);

      // Warm LED strip under shelf (if not bottom)
      if (i < 2) {
        const ledLight = new THREE.PointLight(0xffe6b8, 2.2, 4.0);
        ledLight.position.set(0, yPos + 1.2, 0.1);
        cabinetGroup.add(ledLight);
      }
    });

    scene.add(cabinetGroup);

    // 5. Build Bottles on Shelves
    const bottleMeshes = new Map<string, THREE.Group>();
    const bottlesPerShelf = 6;
    const bottleSpacing = 0.62;
    const textureLoader = new THREE.TextureLoader();

    // Helper to create a single 3D bottle
    function createBottleMesh(wine: WineItem): THREE.Group {
      const bGroup = new THREE.Group();
      bGroup.userData = { wineId: wine.id, wine };
      const colors = getWineColors(wine.type);

      const bodyRadius = 0.19;
      const bodyHeight = 0.58;
      
      // Bottle glass
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: colors.glassColor,
        roughness: 0.15,
        metalness: 0.1,
        transmission: 0.55,
        transparent: true,
        opacity: 0.92,
        clearcoat: 0.6
      });

      // Wine core
      const wineCoreGeom = new THREE.CylinderGeometry(bodyRadius * 0.9, bodyRadius * 0.88, bodyHeight * 0.88, 18);
      const wineCoreMat = new THREE.MeshStandardMaterial({
        color: colors.wineColor,
        roughness: 0.2,
        metalness: 0.05
      });
      const wineCore = new THREE.Mesh(wineCoreGeom, wineCoreMat);
      wineCore.position.y = bodyHeight * 0.44;
      bGroup.add(wineCore);

      // Outer glass body
      const bodyGeom = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, 20);
      const body = new THREE.Mesh(bodyGeom, glassMat);
      body.position.y = bodyHeight * 0.5;
      bGroup.add(body);

      // Shoulder
      const shoulderHeight = 0.22;
      const neckRadius = 0.065;
      const shoulderGeom = new THREE.CylinderGeometry(neckRadius, bodyRadius, shoulderHeight, 20);
      const shoulder = new THREE.Mesh(shoulderGeom, glassMat);
      shoulder.position.y = bodyHeight + shoulderHeight * 0.5;
      bGroup.add(shoulder);

      // Neck
      const neckHeight = 0.32;
      const neckGeom = new THREE.CylinderGeometry(neckRadius, neckRadius, neckHeight, 20);
      const neck = new THREE.Mesh(neckGeom, glassMat);
      neck.position.y = bodyHeight + shoulderHeight + neckHeight * 0.5;
      bGroup.add(neck);

      // Foil Capsule (Corona in alto)
      const capHeight = 0.24;
      const capGeom = new THREE.CylinderGeometry(neckRadius + 0.008, neckRadius + 0.01, capHeight, 20);
      const capMat = new THREE.MeshStandardMaterial({
        color: colors.capsuleColor,
        roughness: 0.3,
        metalness: 0.75
      });
      const cap = new THREE.Mesh(capGeom, capMat);
      cap.position.y = bodyHeight + shoulderHeight + neckHeight * 0.5 + 0.04;
      bGroup.add(cap);

      // Label Texture: Real Photo if available, or procedural parchment
      let labelTexture: THREE.Texture;
      if (wine.photoUrl) {
        labelTexture = textureLoader.load(wine.photoUrl);
        labelTexture.colorSpace = THREE.SRGBColorSpace;
      } else {
        const miniCanvas = document.createElement('canvas');
        miniCanvas.width = 256;
        miniCanvas.height = 320;
        const mCtx = miniCanvas.getContext('2d');
        if (mCtx) {
          mCtx.fillStyle = '#f8f4eb';
          mCtx.fillRect(0, 0, 256, 320);
          mCtx.strokeStyle = '#c5a059';
          mCtx.lineWidth = 5;
          mCtx.strokeRect(8, 8, 240, 304);
          mCtx.fillStyle = '#632332';
          mCtx.font = 'bold 20px serif';
          mCtx.textAlign = 'center';
          mCtx.fillText((wine.winery || 'CANTINA').slice(0, 16).toUpperCase(), 128, 60);
          mCtx.fillStyle = '#1c1417';
          mCtx.font = 'bold 24px serif';
          mCtx.fillText(wine.name.slice(0, 14), 128, 140);
          mCtx.fillStyle = '#c5a059';
          mCtx.font = '22px serif';
          mCtx.fillText('❦ 🍷 ❦', 128, 195);
          mCtx.fillStyle = '#666';
          mCtx.font = 'italic 18px serif';
          mCtx.fillText(`${wine.vintage ? wine.vintage : ''} ${wine.type}`, 128, 250);
        }
        labelTexture = new THREE.CanvasTexture(miniCanvas);
        labelTexture.colorSpace = THREE.SRGBColorSpace;
      }

      // Mini paper label in front
      const labelGeom = new THREE.CylinderGeometry(
        bodyRadius + 0.005,
        bodyRadius + 0.005,
        0.42,
        24,
        1,
        true,
        -Math.PI * 0.45,
        Math.PI * 0.9
      );
      const labelMat = new THREE.MeshStandardMaterial({
        map: labelTexture,
        roughness: 0.45,
        metalness: 0.05
      });
      const labelMesh = new THREE.Mesh(labelGeom, labelMat);
      labelMesh.position.y = bodyHeight * 0.5;
      bGroup.add(labelMesh);

      // Tiny heart / star if favorite
      if (wine.coupleImpressions?.isFavorite) {
        const starGeom = new THREE.BoxGeometry(0.04, 0.04, 0.01);
        const starMat = new THREE.MeshStandardMaterial({
          color: 0xd4af37,
          metalness: 0.9,
          roughness: 0.2
        });
        const starMesh = new THREE.Mesh(starGeom, starMat);
        starMesh.position.set(0, bodyHeight * 0.5 + 0.1, bodyRadius + 0.01);
        starMesh.rotation.z = Math.PI / 4;
        bGroup.add(starMesh);
      }

      return bGroup;
    }

    // Place each wine in the rack (all tasted wines enter the collection, with multi-layer depth)
    const totalShelves = shelfYPositions.length; // 3 shelves
    const capacityPerLayer = bottlesPerShelf * totalShelves; // 18 bottles in front row

    wines.forEach((wine, index) => {
      const bGroup = createBottleMesh(wine);

      const layer = Math.floor(index / capacityPerLayer);
      const slotInLayer = index % capacityPerLayer;
      const shelfIndex = Math.floor(slotInLayer / bottlesPerShelf);
      const colIndex = slotInLayer % bottlesPerShelf;

      const shelfBaseY = shelfYPositions[shelfIndex] + 0.05;
      const startX = -((bottlesPerShelf - 1) * bottleSpacing) / 2;
      const staggerX = (layer % 2 === 1) ? 0.31 : 0;
      const posX = startX + colIndex * bottleSpacing + (colIndex === bottlesPerShelf - 1 && layer % 2 === 1 ? -0.31 : staggerX);
      const posY = shelfBaseY;
      const posZ = 0.05 - layer * 0.18;

      bGroup.userData.homePos = new THREE.Vector3(posX, posY, posZ);

      // If this wine is specifically being animated into the cabinet
      if (animatingWineId === wine.id) {
        // Start floating near camera
        bGroup.position.set(0, 0.2, 3.2);
        bGroup.scale.set(1.4, 1.4, 1.4);
        bGroup.rotation.y = 0;
        bGroup.userData.isAnimating = true;
        bGroup.userData.animProgress = 0;
        sceneStateRef.current.animatingBottleGroup = bGroup;
      } else {
        bGroup.position.set(posX, posY, posZ);
        bGroup.userData.isAnimating = false;
      }

      scene.add(bGroup);
      bottleMeshes.set(wine.id, bGroup);
    });

    // Raycasting & Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      for (const hit of intersects) {
        let parent: THREE.Object3D | null = hit.object;
        while (parent && !parent.userData.wineId && parent !== scene) {
          parent = parent.parent;
        }
        if (parent && parent.userData.wine) {
          onSelectWine(parent.userData.wine);
          return;
        }
      }
    };

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || Math.min(window.innerWidth - 32, 800);
      const isMob = w < 640;
      const isTab = w >= 640 && w < 1024;
      const h = isMob ? 380 : (isTab ? 460 : 540);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.changedTouches[0].clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.changedTouches[0].clientY - rect.top) / rect.height) * 2 + 1;
        onClick();
      }
    };

    window.addEventListener('resize', onResize);
    const domElement = renderer.domElement;
    domElement.addEventListener('mousemove', onPointerMove);
    domElement.addEventListener('click', onClick);
    domElement.addEventListener('touchend', onTouchEnd, { passive: true });

    // Animation Loop
    let animFrameId: number = 0;
    let lastTime = performance.now();

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Smooth camera interpolation
      camera.position.lerp(sceneStateRef.current.targetCameraPos, 0.05);
      sceneStateRef.current.currentLookAt.lerp(sceneStateRef.current.targetLookAt, 0.05);
      camera.lookAt(sceneStateRef.current.currentLookAt);

      // Animation of bottle being placed into cabinet
      const animGroup = sceneStateRef.current.animatingBottleGroup;
      if (animGroup && animGroup.userData.isAnimating) {
        animGroup.userData.animProgress += delta * 0.75;
        const p = Math.min(1, animGroup.userData.animProgress);
        
        // Gentle rotation
        animGroup.rotation.y += delta * 2.5;

        // Ease in-out cubic
        const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

        const startPos = new THREE.Vector3(0, 0.2, 3.2);
        const homePos = animGroup.userData.homePos as THREE.Vector3;
        
        // Arc trajectory
        const currentPos = new THREE.Vector3().lerpVectors(startPos, homePos, ease);
        currentPos.y += Math.sin(p * Math.PI) * 0.45; // arc bump
        animGroup.position.copy(currentPos);

        const currentScale = 1.4 - ease * 0.4;
        animGroup.scale.set(currentScale, currentScale, currentScale);

        if (p >= 1) {
          animGroup.userData.isAnimating = false;
          animGroup.position.copy(homePos);
          animGroup.scale.set(1, 1, 1);
          animGroup.rotation.set(0, 0, 0);
          sceneStateRef.current.animatingBottleGroup = undefined;

          // Trigger confetti celebration
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#d4af37', '#722f37', '#ffffff']
          });

          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }
      }

      // Check raycast hover
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      let foundWine: WineItem | null = null;

      bottleMeshes.forEach((mesh) => {
        if (!mesh.userData.isAnimating) {
          const home = mesh.userData.homePos as THREE.Vector3;
          mesh.position.lerp(home, 0.1);
        }
      });

      for (const hit of intersects) {
        let parent: THREE.Object3D | null = hit.object;
        while (parent && !parent.userData.wineId && parent !== scene) {
          parent = parent.parent;
        }
        if (parent && parent.userData.wine) {
          foundWine = parent.userData.wine;
          // Hover effect: lift bottle slightly forward & up
          if (!parent.userData.isAnimating) {
            const home = parent.userData.homePos as THREE.Vector3;
            parent.position.set(home.x, home.y + 0.08, home.z + 0.12);
          }
          break;
        }
      }

      setHoveredWine(foundWine);

      renderer.render(scene, camera);
    };
    animate();

    sceneStateRef.current = {
      ...sceneStateRef.current,
      scene,
      camera,
      renderer,
      bottleMeshes,
      raycaster,
      mouse,
      animFrameId
    };

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', onResize);
      domElement.removeEventListener('mousemove', onPointerMove);
      domElement.removeEventListener('click', onClick);
      domElement.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
      topCorniceGeom.dispose();
      backWallGeom.dispose();
      sideGeom.dispose();
      shelfGeom.dispose();
      baseGeom.dispose();
    };
  }, [wines, animatingWineId, onSelectWine, onAnimationComplete]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#d4af37]/25 shadow-2xl bg-[#0e090b]">
      {/* Armadio Header & Progression HUD */}
      <div className="absolute top-0 inset-x-0 z-10 bg-gradient-to-b from-[#140b0f]/95 via-[#140b0f]/85 to-transparent p-3 sm:p-5 backdrop-blur-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#d4af37]/15">
        <div className="flex items-center gap-3">
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-[#d1b8ab] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              title="Torna alla sezione precedente"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Indietro</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">{milestones.currentTier.badge}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-2xl font-bold text-[#f5ebd7] tracking-wide">
                  Collezione
                </h3>
                <span className="px-2 py-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
                  {milestones.currentTier.title}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#d1b8ab] mt-0.5">
                {wines.length} {wines.length === 1 ? 'calice degustato e archiviato' : 'calici degustati e archiviati'}
              </p>
            </div>
          </div>
        </div>

        {/* Milestone Progression Bar */}
        <div className="w-full sm:w-64 bg-[#201016]/90 p-2 sm:p-2.5 rounded-xl border border-[#d4af37]/20 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-medium">
            <span className="text-[#e8d5be] flex items-center gap-1">
              <Trophy className="w-3 h-3 text-[#d4af37]" />
              Progresso
            </span>
            <span className="text-[#d4af37] font-semibold">
              {wines.length} / {milestones.nextTier ? milestones.nextTier.targetCount : 'Max'}
            </span>
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-[#12070c] rounded-full overflow-hidden border border-[#d4af37]/20">
            <div 
              className="h-full bg-gradient-to-r from-[#8a1c2f] via-[#d4af37] to-[#f4d068] transition-all duration-700 ease-out"
              style={{ width: `${milestones.progressPercent}%` }}
            />
          </div>
          {milestones.nextTier && (
            <p className="text-[10px] sm:text-[11px] text-[#baa49c] italic text-right truncate">
              Mancano {milestones.nextTier.targetCount - wines.length} assaggi per "{milestones.nextTier.title}"
            </p>
          )}
        </div>
      </div>

      {/* 3D Canvas Mounting Area with responsive height */}
      <div 
        ref={containerRef} 
        className="w-full h-[380px] sm:h-[460px] md:h-[540px] cursor-pointer flex items-center justify-center pt-24 sm:pt-20 touch-none"
        data-testid="three-armadio-canvas"
      />

      {/* Armadio Camera & Shelf Controls */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 flex items-center gap-1.5 sm:gap-2 bg-[#140b0f]/90 p-1 sm:p-1.5 rounded-xl border border-[#d4af37]/20 backdrop-blur-md">
        <button
          onClick={() => setCameraView('full')}
          className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
            cameraView === 'full' 
              ? 'bg-[#722f37] text-white shadow-md' 
              : 'text-[#d1b8ab] hover:text-white hover:bg-white/5'
          }`}
        >
          Vista intera
        </button>
        <button
          onClick={() => setCameraView('shelfTop')}
          className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
            cameraView === 'shelfTop' 
              ? 'bg-[#722f37] text-white shadow-md' 
              : 'text-[#d1b8ab] hover:text-white hover:bg-white/5'
          }`}
        >
          Ripiano alto
        </button>
        <button
          onClick={() => setCameraView('shelfBottom')}
          className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
            cameraView === 'shelfBottom' 
              ? 'bg-[#722f37] text-white shadow-md' 
              : 'text-[#d1b8ab] hover:text-white hover:bg-white/5'
          }`}
        >
          Ripiano basso
        </button>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredWine && (
        <div className="absolute bottom-16 sm:bottom-4 right-3 sm:right-4 left-3 sm:left-auto max-w-sm bg-[#1c0e14]/95 border border-[#d4af37]/40 p-3 sm:p-4 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#d4af37]">
                {hoveredWine.type} • {hoveredWine.region}
              </span>
              <h4 className="font-serif text-lg font-bold text-white line-clamp-1">
                {hoveredWine.name}
              </h4>
              <p className="text-xs text-[#baa49c] line-clamp-1">{hoveredWine.winery} {hoveredWine.vintage && `(${hoveredWine.vintage})`}</p>
            </div>
            {hoveredWine.coupleImpressions.isFavorite && (
              <span className="text-base" title="Vino del cuore di coppia">❤️</span>
            )}
          </div>
          
          <div className="mt-2.5 pt-2 border-t border-[#d4af37]/15 flex items-center justify-between text-xs">
            <span className="text-[#f5ebd7] font-medium flex items-center gap-1">
              ⭐ Media coppia: {(( (hoveredWine.coupleImpressions?.heRating ?? 5) + (hoveredWine.coupleImpressions?.sheRating ?? 5) ) / 2).toFixed(1)}/5
            </span>
            <span className="text-[#d4af37] font-serif italic text-[11px] flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> Apri scheda
            </span>
          </div>
        </div>
      )}

      {/* Add bottle floating prompt if few wines */}
      {wines.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/60 p-6 text-center">
          <h4 className="font-serif text-2xl text-white font-bold mb-2">Il vostro armadio è ancora vuoto</h4>
          <p className="text-sm text-[#d1b8ab] max-w-md mb-4">
            Catalogate la vostra prima bottiglia assaggiata per vederla apparire magicamente nel vostro grande armadio cantina 3D!
          </p>
          <button
            onClick={onAddNewWine}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8a1c2f] to-[#b32b43] text-white font-medium shadow-lg hover:brightness-110 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Aggiungi primo calice
          </button>
        </div>
      )}
    </div>
  );
}
