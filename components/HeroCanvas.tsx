'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Skip on low-end devices or if user prefers reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    // ── SCENE SETUP ──
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.z = 5

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      return // WebGL not available
    }
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── MATERIALS ──
    const goldMaterial = new THREE.MeshBasicMaterial({
      color: 0xC9A84C, wireframe: true, transparent: true, opacity: 0.18,
    })
    const goldMaterialFaint = new THREE.MeshBasicMaterial({
      color: 0xC9A84C, wireframe: true, transparent: true, opacity: 0.08,
    })

    // ── PARTICLES ──
    const particles: THREE.Mesh[] = []
    const particleData: Array<{
      rotSpeed: THREE.Vector3; floatSpeed: number; floatOffset: number; originalY: number
    }> = []

    for (let i = 0; i < 90; i++) {
      const isLarge  = i < 15
      const isMedium = i >= 15 && i < 45
      let geometry: THREE.BufferGeometry

      if (i % 3 === 0) {
        geometry = new THREE.OctahedronGeometry(isLarge ? 0.35 : isMedium ? 0.18 : 0.09, 0)
      } else if (i % 3 === 1) {
        geometry = new THREE.IcosahedronGeometry(isLarge ? 0.28 : isMedium ? 0.14 : 0.07, 0)
      } else {
        geometry = new THREE.TetrahedronGeometry(isLarge ? 0.22 : isMedium ? 0.11 : 0.06, 0)
      }

      const mat  = isLarge ? goldMaterial : goldMaterialFaint
      const mesh = new THREE.Mesh(geometry, mat)

      mesh.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4 - 1,
      )
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      )

      scene.add(mesh)
      particles.push(mesh)
      particleData.push({
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.003,
          (Math.random() - 0.5) * 0.004,
          (Math.random() - 0.5) * 0.002,
        ),
        floatSpeed:  0.0003 + Math.random() * 0.0004,
        floatOffset: Math.random() * Math.PI * 2,
        originalY:   mesh.position.y,
      })
    }

    // ── MOUSE PARALLAX ──
    const mouse  = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    function onMouseMove(e: MouseEvent) {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── ANIMATION LOOP ──
    let frameId: number
    let elapsed = 0

    function animate() {
      frameId = requestAnimationFrame(animate)
      elapsed += 0.016

      target.x += (mouse.x - target.x) * 0.02
      target.y += (mouse.y - target.y) * 0.02

      camera.position.x += (target.x * 0.3 - camera.position.x) * 0.05
      camera.position.y += (-target.y * 0.2 - camera.position.y) * 0.05
      camera.lookAt(scene.position)

      particles.forEach((mesh, i) => {
        const data = particleData[i]
        mesh.rotation.x += data.rotSpeed.x
        mesh.rotation.y += data.rotSpeed.y
        mesh.rotation.z += data.rotSpeed.z
        mesh.position.y = data.originalY + Math.sin(elapsed * data.floatSpeed * 60 + data.floatOffset) * 0.15
        mesh.position.x += data.rotSpeed.x * 0.3
        if (mesh.position.x > 8)  mesh.position.x = -8
        if (mesh.position.x < -8) mesh.position.x = 8
      })

      renderer.render(scene, camera)
    }
    animate()

    // ── RESIZE ──
    function onResize() {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    // ── CLEANUP ──
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      particles.forEach(m => m.geometry.dispose())
      goldMaterial.dispose()
      goldMaterialFaint.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-[1] pointer-events-none"
      aria-hidden="true"
    />
  )
}
