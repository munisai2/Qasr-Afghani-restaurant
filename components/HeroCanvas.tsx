'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const isMobile = window.innerWidth < 768

    // ── SCENE SETUP ──
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(35, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 10)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch { return }
    
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.0)
    scene.add(ambientLight)

    // ── CACHED GEOMETRIES & MATERIALS ──
    const geometriesToDispose: THREE.BufferGeometry[] = []
    const materialsToDispose: THREE.Material[] = []

    const registerCleanup = (geo?: THREE.BufferGeometry, mat?: THREE.Material | THREE.Material[]) => {
      if (geo) geometriesToDispose.push(geo)
      if (mat) {
        if (Array.isArray(mat)) materialsToDispose.push(...mat)
        else materialsToDispose.push(mat)
      }
    }

    // ── SKEWER PLANES & SHADERS ──
    const tl = new THREE.TextureLoader()

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `
    // Dynamic Sear Fragment Shader
    const fragmentShader = `
      uniform sampler2D tDiffuse;
      uniform vec2 uHoverUV;
      uniform float uTime;
      uniform float uAspect;
      uniform float uBaseOpacity;
      varying vec2 vUv;

      void main() {
        vec4 texColor = texture2D(tDiffuse, vUv);
        if(texColor.a < 0.05) discard;

        // Correct distance calculation using dynamic image proportion
        vec2 uvCorrected = vec2(vUv.x, vUv.y * uAspect);
        vec2 hoverCorrected = vec2(uHoverUV.x, uHoverUV.y * uAspect);
        
        float dist = distance(uvCorrected, hoverCorrected);
        
        float burnRadius = 0.45; 
        float intensity = smoothstep(burnRadius, 0.0, dist);

        vec3 burnColor = vec3(1.0, 0.35, 0.0);
        float flicker = 0.8 + 0.2 * sin(uTime * 15.0 + vUv.y * 40.0);

        vec3 finalColor = mix(texColor.rgb, burnColor, intensity * flicker * 0.85);
        finalColor += burnColor * intensity * flicker * 0.55;

        // Apply background fading opacity
        gl_FragColor = vec4(finalColor, texColor.a * uBaseOpacity);
      }
    `

    const skewers: { mesh: THREE.Mesh, mat: THREE.ShaderMaterial, baseX: number, baseY: number, baseRotZ: number, parallax: number }[] = []

    // Helper to dynamically load texture, scale cleanly avoiding stretches, and place into scene
    const loadSkewerPlane = (path: string, x: number, y: number, z: number, rotZ: number, scale: number, parallax: number, baseOpacity: number = 1.0) => {
      tl.load(
        path,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace
          
          // Image native dimension math
          const imgWidth = texture.image.width || 1
          const imgHeight = texture.image.height || 1
          const aspect = imgWidth / imgHeight
          
          // Baseline height bounds logic
          const targetHeight = 5.6
          const targetWidth = targetHeight * aspect
          
          const planeGeo = new THREE.PlaneGeometry(targetWidth, targetHeight)
          registerCleanup(planeGeo)

          const mat = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
              tDiffuse: { value: texture },
              uHoverUV: { value: new THREE.Vector2(-1, -1) },
              uTime: { value: 0 },
              uAspect: { value: (1.0 / aspect) }, // Feed physical proportion to burn shader
              uBaseOpacity: { value: baseOpacity }
            },
            transparent: true,
            side: THREE.DoubleSide
          })
          registerCleanup(undefined, mat)

          const mesh = new THREE.Mesh(planeGeo, mat)
          mesh.position.set(x, y, z)
          mesh.rotation.z = rotZ
          mesh.scale.setScalar(scale)
          scene.add(mesh)

          skewers.push({
            mesh, mat, baseX: x, baseY: y, baseRotZ: rotZ, parallax
          })
        },
        undefined, // onProgress
        (err) => console.error(`Failed to load ${path}`, err) // onError
      )
    }

    // ── SCENE COMPOSITION ──
    if (!isMobile) {
      // Background Skewers (Faded, Out of Focus scale, further Z-depth)
      loadSkewerPlane('/skewer-bg1.png', -2.8, -1.0, -4.5, -0.4, 0.45, 0.05, 0.3)
      loadSkewerPlane('/skewer-bg2.png',  3.2,  1.5, -6.0,  0.5, 0.55, 0.08, 0.25)
      
      // Main Center Hero Skewer (Sharp, Forefront scale, Heavy Raycaster Parallax)
      loadSkewerPlane('/skewer.png',      0.5,  0.2,  1.5, -0.45, 0.90, 0.35, 1.0)
    } else {
      // Mobile - 2 Skewers (1 Main, 1 Faded Background)
      loadSkewerPlane('/skewer-bg1.png',-1.2, -0.8, -4.0, -0.35, 0.40, 0.05, 0.3)
      loadSkewerPlane('/skewer.png',     0.0,  0.5,  1.0, -0.50, 0.90, 0.35, 1.0)
    }

    // ── EMBER PARTICLES ──
    const particleCount = isMobile ? 60 : 120
    const embersGeo = new THREE.BufferGeometry()
    const posArray = new Float32Array(particleCount * 3)
    const colorArray = new Float32Array(particleCount * 3)
    
    const emberColorHexes = [0xC9A84C, 0xFF6B1A, 0xFFB347, 0xFF4500, 0xFFD700]

    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3]     = (Math.random() - 0.5) * 6     
      posArray[i * 3 + 1] = -2.5 - Math.random() * 2      
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 2     
      
      const c = new THREE.Color(emberColorHexes[i % emberColorHexes.length])
      colorArray[i * 3] = c.r
      colorArray[i * 3 + 1] = c.g
      colorArray[i * 3 + 2] = c.b
    }
    embersGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    embersGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))

    const embersMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    })
    const embers = new THREE.Points(embersGeo, embersMat)
    scene.add(embers)
    registerCleanup(embersGeo, embersMat)

    // ── INTERACTIVITY & RAYCASTER ──
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(-999, -999)
    let targetX = 0, targetY = 0

    const onMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1
      targetY = -(e.clientY / window.innerHeight) * 2 + 1
      mouse.x = targetX
      mouse.y = targetY
    }
    const onMouseLeave = () => {
      mouse.x = -999
      mouse.y = -999
    }
    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        targetX = Math.max(-1, Math.min(1, e.gamma / 45))
        targetY = Math.max(-1, Math.min(1, (e.beta - 45) / 45))
      }
    }

    if (isMobile) {
      window.addEventListener('deviceorientation', onDeviceOrientation)
    } else {
      window.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseleave', onMouseLeave)
    }

    // ── ANIMATION LOOP ──
    const startTime = performance.now()
    let frameId: number

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const time = (performance.now() - startTime) * 0.001

      const scrollProgress = window.scrollY / window.innerHeight
      renderer.domElement.style.opacity = Math.max(0, 1 - scrollProgress * 1.8).toString()

      // Shader Intersections
      if (!isMobile && skewers.length > 0) {
        raycaster.setFromCamera(mouse, camera)
        
        skewers.forEach(s => {
          s.mat.uniforms.uHoverUV.value.lerp(new THREE.Vector2(-1, -1), 0.1)
        })

        const intersects = raycaster.intersectObjects(skewers.map(s => s.mesh))
        if (intersects.length > 0) {
          const hit = intersects[0]
          const targetSkewer = skewers.find(s => s.mesh === hit.object)
          // Specifically only allow intersections on fully opaque Main skewers to avoid weird raycasted burns on blurred BG elements
          if (targetSkewer && hit.uv && targetSkewer.mat.uniforms.uBaseOpacity.value > 0.8) {
            targetSkewer.mat.uniforms.uHoverUV.value.lerp(hit.uv, 0.4)
          }
        }
      }

      // Parallax updates for successfully loaded meshes
      skewers.forEach((s, idx) => {
        s.mat.uniforms.uTime.value = time

        const idleY = Math.sin(time * 0.4 + idx * 1.2) * 0.003
        s.mesh.rotation.z = s.baseRotZ + scrollProgress * (idx - 1.5) * 0.15 + Math.sin(time * 0.3 + idx * 0.8) * 0.01

        const finalBaseY = s.baseY - scrollProgress * (1.5 + idx * 0.3)
        const finalBaseX = s.baseX + scrollProgress * (idx - 1.5) * 0.8

        s.mesh.position.x += (finalBaseX + targetX * s.parallax - s.mesh.position.x) * 0.06
        s.mesh.position.y += (finalBaseY + targetY * s.parallax * 0.6 + idleY - s.mesh.position.y) * 0.06
      })

      // Embers
      const positions = embersGeo.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.025
        positions[i * 3] += Math.sin(time * 3 + i) * 0.004
        
        if (positions[i * 3 + 1] > 5) {
          positions[i * 3 + 1] = -2.5 - Math.random() * 2
          positions[i * 3] = (Math.random() - 0.5) * 6
        }
      }
      embersGeo.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }
    animate()

    // ── RESIZE ──
    const onResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('deviceorientation', onDeviceOrientation)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      
      scene.traverse(obj => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose()
        if ((obj as THREE.Mesh).material) {
          const mat = (obj as THREE.Mesh).material
          if (Array.isArray(mat)) mat.forEach(m => m.dispose())
          else mat.dispose()
        }
      })

      geometriesToDispose.forEach(g => g.dispose())
      materialsToDispose.forEach(m => m.dispose())
      
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-[2]"
    />
  )
}
