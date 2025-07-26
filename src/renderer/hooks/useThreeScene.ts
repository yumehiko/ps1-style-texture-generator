import { useEffect, useRef, useState, RefObject } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { ProcessedImageData } from '../types/image';

interface UseThreeSceneProps {
  processedImage: ProcessedImageData | null;
  previewRotation: boolean;
}

interface UseThreeSceneReturn {
  mountRef: RefObject<HTMLDivElement>;
  webGLError: string | null;
  isSceneReady: boolean;
}

export const useThreeScene = ({ processedImage, previewRotation }: UseThreeSceneProps): UseThreeSceneReturn => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cubeRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [webGLError, setWebGLError] = useState<string | null>(null);
  const [isSceneReady, setIsSceneReady] = useState(false);

  // WebGLサポートチェック
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebGLError('WebGL is not supported in your browser');
    }
  }, []);

  // Three.jsシーンの初期化
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount || webGLError) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // シーン作成
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // カメラ作成
    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      1000
    );
    camera.position.set(3, 3, 3);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // レンダラー作成
    const renderer = new THREE.WebGLRenderer({
      antialias: false, // PS1風にするためアンチエイリアスを無効化
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1); // レトロ感を出すため低解像度に
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ライト追加
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // 立方体作成
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cubeRef.current = cube;

    // OrbitControls追加
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controlsRef.current = controls;

    setIsSceneReady(true);

    // クリーンアップ
    return () => {
      setIsSceneReady(false);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      controls.dispose();
    };
  }, [webGLError]);

  // テクスチャ適用
  useEffect(() => {
    if (!processedImage || !cubeRef.current || !rendererRef.current) return;

    try {
      // ImageDataからテクスチャを作成
      const canvas = document.createElement('canvas');
      canvas.width = processedImage.width;
      canvas.height = processedImage.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageData = new ImageData(
        processedImage.data,
        processedImage.width,
        processedImage.height
      );
      ctx.putImageData(imageData, 0, 0);

      // Three.jsテクスチャに変換
      const texture = new THREE.CanvasTexture(canvas);
      texture.magFilter = THREE.NearestFilter; // ピクセレート効果
      texture.minFilter = THREE.NearestFilter;
      texture.needsUpdate = true;

      // マテリアルを更新
      const material = new THREE.MeshPhongMaterial({
        map: texture,
        shininess: 10,
        specular: new THREE.Color(0x222222)
      });

      // 古いマテリアルを破棄
      if (cubeRef.current.material instanceof THREE.Material) {
        cubeRef.current.material.dispose();
      }

      cubeRef.current.material = material;
    } catch (error) {
      console.error('Failed to apply texture:', error);
    }
  }, [processedImage]);

  // アニメーションループ
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // 自動回転
      if (cubeRef.current && previewRotation) {
        cubeRef.current.rotation.y += 0.005;
      }

      // コントロール更新
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // レンダリング
      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [previewRotation]);

  // リサイズハンドリング
  useEffect(() => {
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    mountRef: mountRef as RefObject<HTMLDivElement>,
    webGLError,
    isSceneReady
  };
};