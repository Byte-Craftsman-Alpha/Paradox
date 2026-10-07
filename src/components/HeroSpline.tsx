"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { onScroll } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { RotateCcw } from "lucide-react";

export function HeroSpline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const resetRef = useRef<() => void>(() => {});
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = prefersReducedMotion();

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 11);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Color detection
    function getColors() {
      const isDark = document.documentElement.getAttribute("data-theme") === "charcoal";
      return {
        primary: isDark ? 0xfcfbf7 : 0x191a18,
        secondary: isDark ? 0xb8b4a8 : 0x68665f,
        hairline: isDark ? 0x3b3c38 : 0xd3cec4,
        node: isDark ? 0xffffff : 0x191a18,
      };
    }
    let colors = getColors();

    // 3D Spline Curve Generation (Parametric Trefoil / Paradox knot)
    const pointsCount = 18;
    const curvePoints: THREE.Vector3[] = [];
    for (let i = 0; i < pointsCount; i++) {
      const u = (i / pointsCount) * Math.PI * 2;
      // Mathematical knot: continuous closed 3D spline
      const x = Math.sin(u) * (2.4 + Math.cos(2 * u)) * 1.5;
      const y = Math.cos(u) * (1.8 + Math.sin(3 * u) * 0.3) * 1.05;
      const z = Math.sin(2 * u) * 1.6;
      curvePoints.push(new THREE.Vector3(x, y, z));
    }
    const splineCurve = new THREE.CatmullRomCurve3(curvePoints, true, "centripetal", 0.5);

    // Main 3D Spline Group
    const splineGroup = new THREE.Group();
    scene.add(splineGroup);

    // 1. Core High-Res Spline Line
    const splinePoints = splineCurve.getPoints(360);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(splinePoints);
    const lineMat = new THREE.LineBasicMaterial({
      color: colors.primary,
      transparent: true,
      opacity: 0.85,
    });
    const mainSplineLine = new THREE.Line(lineGeo, lineMat);
    splineGroup.add(mainSplineLine);

    // 2. 3D Architectural Wireframe Tube
    const tubeGeo = new THREE.TubeGeometry(splineCurve, 200, 0.08, 8, true);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: colors.secondary,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    splineGroup.add(tubeMesh);

    // 3. Orthogonal Structural Rib Rings along Spline Frames
    const ribGroup = new THREE.Group();
    const ribCount = 48;
    const frames = splineCurve.computeFrenetFrames(ribCount, true);
    const ringGeo = new THREE.RingGeometry(0.18, 0.22, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colors.hairline,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });

    for (let i = 0; i < ribCount; i++) {
      const t = i / ribCount;
      const pt = splineCurve.getPointAt(t);
      const tangent = frames.tangents[i];
      const normal = frames.normals[i];
      const binormal = frames.binormals[i];

      const ribMesh = new THREE.Mesh(ringGeo, ringMat);
      ribMesh.position.copy(pt);

      const m = new THREE.Matrix4();
      m.makeBasis(normal, binormal, tangent);
      ribMesh.rotation.setFromRotationMatrix(m);
      ribGroup.add(ribMesh);
    }
    splineGroup.add(ribGroup);

    // 4. Kinetic Pulses / Nodes Traveling Along the 3D Spline
    const nodeCount = 10;
    const nodeGeo = new THREE.OctahedronGeometry(0.09, 0);
    const nodeMat = new THREE.MeshBasicMaterial({
      color: colors.node,
      wireframe: true,
    });

    const nodes: THREE.Mesh[] = [];
    const nodeOffsets: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      splineGroup.add(node);
      nodes.push(node);
      nodeOffsets.push(i / nodeCount);
    }

    // 5. Subtle Swiss Hairline Coordinates Compass / Reference Plane
    const compassGroup = new THREE.Group();
    const circleGeo = new THREE.BufferGeometry();
    const circlePts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      circlePts.push(new THREE.Vector3(Math.cos(theta) * 4.4, -2.4, Math.sin(theta) * 4.4));
    }
    circleGeo.setFromPoints(circlePts);
    const compassMat = new THREE.LineBasicMaterial({
      color: colors.hairline,
      transparent: true,
      opacity: 0.35,
    });
    compassGroup.add(new THREE.Line(circleGeo, compassMat));
    scene.add(compassGroup);

    // Theme mutation observer
    const observer = new MutationObserver(() => {
      colors = getColors();
      lineMat.color.setHex(colors.primary);
      tubeMat.color.setHex(colors.secondary);
      ringMat.color.setHex(colors.hairline);
      nodeMat.color.setHex(colors.node);
      compassMat.color.setHex(colors.hairline);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // Interaction & Animation State
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0.2;
    let targetRotY = 0;
    let scrollY = 0;
    let scrollVelocity = 0;
    let dragVelocityX = 0;
    let dragVelocityY = 0;
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let isVisible = true;

    // Viewport Intersection Observer
    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    io.observe(container);

    // Pointer events for hover & drag
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const dx = e.clientX - prevPointerX;
        const dy = e.clientY - prevPointerY;
        prevPointerX = e.clientX;
        prevPointerY = e.clientY;

        dragVelocityY += dx * 0.005;
        dragVelocityX += dy * 0.005;
      } else {
        mouseX = nx;
        mouseY = ny;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      setIsInteracting(true);
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      container.style.cursor = "grabbing";
    };

    const onPointerUp = () => {
      isDragging = false;
      setIsInteracting(false);
      container.style.cursor = "grab";
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    // Scroll sync
    const unsubscribeScroll = onScroll(({ scroll, velocity }) => {
      scrollY = scroll;
      scrollVelocity = velocity;
    });

    // Resize handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // Render loop
    let rafId = 0;
    let tClock = 0;

    const animate = () => {
      rafId = requestAnimationFrame(animate);

      if (!isVisible) return;

      if (reduced) {
        // Static frame for reduced motion
        renderer.render(scene, camera);
        return;
      }

      tClock += 0.006 + Math.min(Math.abs(scrollVelocity) * 0.0004, 0.04);

      // Scroll-driven rotation & position
      const scrollRotY = scrollY * 0.0018;
      const scrollRotX = scrollY * 0.001;
      const scrollDollyZ = Math.min(scrollY * 0.002, 1.8);

      // Inertia drag decay
      dragVelocityX *= 0.92;
      dragVelocityY *= 0.92;
      targetRotX += dragVelocityX;
      targetRotY += dragVelocityY;

      // Mouse parallax + base auto-spin
      targetRotY += 0.002;
      const hoverTiltX = mouseY * 0.25;
      const hoverTiltY = mouseX * 0.35;

      // Smooth lerp into actual rotation
      splineGroup.rotation.x += (targetRotX + hoverTiltX + scrollRotX - splineGroup.rotation.x) * 0.06;
      splineGroup.rotation.y += (targetRotY + hoverTiltY + scrollRotY - splineGroup.rotation.y) * 0.06;
      splineGroup.rotation.z = Math.sin(tClock * 0.6) * 0.08;

      // Camera depth response
      camera.position.z = 11 + scrollDollyZ;

      // Update travelling kinetic nodes along 3D spline
      for (let i = 0; i < nodeCount; i++) {
        const u = (nodeOffsets[i] + tClock * 0.25) % 1;
        const pt = splineCurve.getPointAt(u);
        nodes[i].position.copy(pt);
        nodes[i].rotation.x += 0.03;
        nodes[i].rotation.y += 0.04;
      }

      // Compass counter-rotation
      compassGroup.rotation.y = -splineGroup.rotation.y * 0.3;

      renderer.render(scene, camera);

      // Update readout angle occasionally
      const deg = Math.round(((splineGroup.rotation.y * 180) / Math.PI) % 360);
      setRotationAngle(deg < 0 ? deg + 360 : deg);
    };

    resetRef.current = () => {
      targetRotX = 0.2;
      targetRotY = 0;
      dragVelocityX = 0;
      dragVelocityY = 0;
      splineGroup.rotation.x = 0.2;
      splineGroup.rotation.y = 0;
    };

    container.style.cursor = "grab";
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      observer.disconnect();
      unsubscribeScroll();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);

      // Dispose Three.js resources
      lineGeo.dispose();
      lineMat.dispose();
      tubeGeo.dispose();
      tubeMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      circleGeo.dispose();
      compassMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none" aria-hidden="true">
      <div ref={containerRef} className="absolute inset-0 w-full h-full touch-none" />

      {/* Swiss Telemetry Overlay HUD */}
      <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[var(--meta)] font-mono">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--fg)] animate-pulse" />
        <span>3D Spline · Catmull-Rom</span>
      </div>

      <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.18em] text-[var(--meta)] font-mono hidden sm:flex items-center gap-3">
        <span>θ {String(rotationAngle).padStart(3, "0")}°</span>
        <span>/</span>
        <span>Drag to orbit</span>
        <button
          type="button"
          onClick={() => resetRef.current?.()}
          aria-label="Reset spline orientation"
          className="inline-flex items-center gap-1 text-[var(--meta)] hover:text-[var(--fg)] cursor-pointer ml-2 border px-1.5 py-0.5 border-[var(--hairline)]"
        >
          <RotateCcw size={10} />
          <span>Reset</span>
        </button>
      </div>

      {isInteracting && (
        <div className="absolute top-3 right-3 pointer-events-none text-[10px] uppercase tracking-[0.16em] text-[var(--fg)] bg-[var(--bg)]/90 px-2 py-0.5 border border-[var(--hairline)]">
          Orbiting
        </div>
      )}
    </div>
  );
}

