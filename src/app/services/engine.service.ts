import { ElementRef, Injectable, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoughnessMipmapper } from 'three/examples/jsm/utils/RoughnessMipmapper.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

@Injectable({ providedIn: 'root' })
export class EngineService implements OnDestroy {
  private rotate: boolean = true;

  private canvas: ElementRef<HTMLDivElement>;

  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private pmremGenerator: THREE.PMREMGenerator;
  private roughnessMipmapper: RoughnessMipmapper;
  private loader: GLTFLoader;
  private model: THREE.Scene;
  private envMap;

  private grid: THREE.GridHelper;
  private controls: OrbitControls;

  private frameId: number = null;

  constructor(private ngZone: NgZone) {}

  public debug() {
    this.scene.add(new THREE.AxesHelper(20));
  }

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  init(rendererCanvas: ElementRef<HTMLDivElement>) {
    this.canvas = rendererCanvas;

    this.setRenderer();
    this.setCamera();
    this.setGrid();
    this.setScene();
    this.setControls();

    this.debug();

    this.canvas.nativeElement.appendChild(this.renderer.domElement);
    this.setLoaders();
  }

  //renderizador
  private setRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
  }

  //camara
  private setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    this.camera.position.set(100, 100, 100);
  }

  //grilla guia
  private setGrid() {
    this.grid = new THREE.GridHelper(500, 10, 0xffffff, 0xffffff);
    this.grid.material.opacity = 0.5;
    this.grid.material.depthWrite = false;
    this.grid.material.transparent = true;
  }

  private setScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xbbbbbb);
    this.scene.add(this.grid);
  }

  private setControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 2;
    this.controls.maxDistance = 10;
    this.controls.target.set(0, 0, -0.2);
  }

  private setLoaders() {
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();
    new RGBELoader()
      .setDataType(THREE.UnsignedByteType)
      .setPath('https://threejs.org/examples/textures/equirectangular/')
      .load('royal_esplanade_1k.hdr', this.loadLoader.bind(this));
  }

  private loadLoader(texture) {
    this.envMap = this.pmremGenerator.fromEquirectangular(texture).texture;

    this.pmremGenerator.fromEquirectangular(texture).texture;

    this.scene.background = this.envMap;
    this.scene.environment = this.envMap;

    texture.dispose();
    this.pmremGenerator.dispose();

    this.render();

    this.roughnessMipmapper = new RoughnessMipmapper(this.renderer);
    /*
    this.loader = new GLTFLoader().setPath(
      'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/'
    );
    this.loader.load('DamagedHelmet.gltf', this.cargaGltf.bind(this));
    */

    this.loader = new GLTFLoader().setPath(
        'https://www.dominioagil.cl/repo/zapatilla_gltf/'
    );
    this.loader.load('zapati.gltf', this.cargaGltf.bind(this));
  }

  private generateMipMaps(child) {
    if (child.isMesh) {
      console.log('perrito');
      this.roughnessMipmapper.generateMipmaps(child.material);
    }
  }

  private cargaGltf(gltf) {
    this.model = gltf.scene;

    this.model.traverse(this.generateMipMaps.bind(this));

    this.scene.add(this.model);

    this.roughnessMipmapper.dispose();

    this.animate();
  }

  public stopRotation(): void {
    this.rotate = false;
  }

  public resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);

    this.render();
  }

  public animate() {
    this.controls.update();

    if (this.model && this.rotate) {
      this.model.rotation.y += 0.005;
    }

    this.render();
    requestAnimationFrame(this.animate.bind(this));
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }
}
