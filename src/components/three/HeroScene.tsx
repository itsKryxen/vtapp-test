'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * WebGL hero background.
 *
 * Budget-conscious by design, this is the only WebGL on the site:
 *  - device pixel ratio capped at 1.75
 *  - particle count scales down on narrow screens
 *  - render loop pauses when the tab or the hero is out of view
 *  - bails out entirely on prefers-reduced-motion or when WebGL is missing,
 *    leaving the CSS gradient background visible underneath
 */
export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return; // no WebGL, the CSS background stands in
    }

    const width = mount.clientWidth;
    const height = mount.clientHeight;
    const isNarrow = width < 768;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040404, 0.055);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 0, 13);

    // ---------------------------------------------------------------- lights
    scene.add(new THREE.AmbientLight(0xb32821, 0.55));

    const keyLight = new THREE.PointLight(0xe0685e, 95, 60);
    keyLight.position.set(-9, 6, 10);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xb32821, 80, 60);
    rimLight.position.set(10, -5, 6);
    scene.add(rimLight);

    // ------------------------------------------------------- core polyhedron
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const coreGeo = new THREE.IcosahedronGeometry(3.1, 1);

    const coreMesh = new THREE.Mesh(
      coreGeo,
      new THREE.MeshStandardMaterial({
        color: 0x141414,
        metalness: 0.85,
        roughness: 0.28,
        flatShading: true,
        transparent: true,
        opacity: 0.92,
      })
    );
    coreGroup.add(coreMesh);

    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(coreGeo),
      new THREE.LineBasicMaterial({ color: 0xb32821, transparent: true, opacity: 0.7 })
    );
    wire.scale.setScalar(1.015);
    coreGroup.add(wire);

    // Outer shell, a second, larger wireframe that counter-rotates
    const shell = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(4.6, 0)),
      new THREE.LineBasicMaterial({ color: 0xe0685e, transparent: true, opacity: 0.3 })
    );
    scene.add(shell);

    // ------------------------------------------------------------- particles
    const count = isNarrow ? 900 : 2200;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const r = 8 + Math.random() * 16;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = r * Math.cos(phi);
      speeds[i] = 0.15 + Math.random() * 0.5;
    }

    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        color: 0xf0b3ad,
        size: 0.055,
        transparent: true,
        opacity: 0.75,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    scene.add(dust);

    // ------------------------------------------------------------ interaction
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      target.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // ------------------------------------------------------------ resize/vis
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mount);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(mount);

    const onVisibility = () => {
      visible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibility);

    // ------------------------------------------------------------- animation
    const clock = new THREE.Clock();
    let frame = 0;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visible) return;

      const t = clock.getElapsedTime();
      const dt = Math.min(clock.getDelta(), 0.05);

      pointer.x += (target.x - pointer.x) * 0.045;
      pointer.y += (target.y - pointer.y) * 0.045;

      coreGroup.rotation.y = t * 0.16 + pointer.x * 0.4;
      coreGroup.rotation.x = Math.sin(t * 0.22) * 0.18 + pointer.y * 0.25;
      coreGroup.position.y = Math.sin(t * 0.6) * 0.22;

      shell.rotation.y = -t * 0.09 - pointer.x * 0.22;
      shell.rotation.z = t * 0.05;

      dust.rotation.y = t * 0.022;

      const pos = dustGeo.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < count; i++) {
        arr[i * 3 + 1] += speeds[i] * dt * 0.35;
        if (arr[i * 3 + 1] > 11) arr[i * 3 + 1] = -11;
      }
      pos.needsUpdate = true;

      camera.position.x += (pointer.x * 1.4 - camera.position.x) * 0.05;
      camera.position.y += (-pointer.y * 0.9 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      keyLight.position.x = Math.sin(t * 0.5) * 10;
      rimLight.position.y = Math.cos(t * 0.4) * 7;

      renderer.render(scene, camera);
    };
    tick();

    // --------------------------------------------------------------- cleanup
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
      resizeObserver.disconnect();
      io.disconnect();

      scene.traverse((obj) => {
        const anyObj = obj as THREE.Mesh | THREE.Points | THREE.LineSegments;
        anyObj.geometry?.dispose?.();
        const mat = anyObj.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose?.();
      });

      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 [mask-image:radial-gradient(70%_70%_at_50%_45%,#000_55%,transparent_100%)]"
    />
  );
}
