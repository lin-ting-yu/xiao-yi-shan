import { Component, ElementRef, HostListener } from '@angular/core';
import {
  Color, Fog, Mesh, MeshPhysicalMaterial,
  MeshStandardMaterialParameters, OrthographicCamera, PMREMGenerator,
  PointLight, Raycaster, Scene, TextureLoader,
  Vector2, Vector3, WebGLRenderer
} from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private el: ElementRef
  ) {
    this.scene = new Scene();
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new OrthographicCamera(
      this.frustumSize * aspect / - 2,
      this.frustumSize * aspect / 2,
      this.frustumSize / 2,
      this.frustumSize / - 2,
      1, 1000
    );
    this.renderer = new WebGLRenderer();
    const environment = new RoomEnvironment();
    const pmremGenerator = new PMREMGenerator(this.renderer);


    const light1 = new PointLight(0x444444, 5, 100);
    const light2 = new PointLight(0x444444, 5, 100);
    light1.position.set(10, -5, 5);
    light2.position.set(-10, -5, 5);
    this.scene.add(
      light1,
      light2,
    );
    this.scene.environment = pmremGenerator.fromScene(
      environment,
      100,
    ).texture;
    this.scene.fog = new Fog(0xeeeeee, 1.8, 3);
    this.scene.background = new Color(0xeeeeee);
    // this.scene.add( new AxesHelper( 20 ) );
    this.camera.position.z = 2;

    this.camera.lookAt(new Vector3(0, 0, 0));
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0xeeeeee, 1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.el.nativeElement.appendChild(this.renderer.domElement);
  }

  private readonly frustumSize = 3;
  private readonly objLoader: OBJLoader = new OBJLoader();
  private readonly textureLoader: TextureLoader = new TextureLoader();
  private raycaster = new Raycaster();
  private scene: Scene;
  private camera: OrthographicCamera;
  private renderer: WebGLRenderer;
  private cubeList: Mesh[] = [];

  private speed: number = 0.1;
  private mouseDotNowPos!: Vector2;
  private mousePos!: Vector2;
  private pointer!: Vector2;
  INTERSECTED!: any;

  mousePosCss: { [key: string]: string } = { opacity: '0' };
  @HostListener('window:resize')
  onWindowResize() {

    const aspect = window.innerWidth / window.innerHeight;
    this.camera.left = - this.frustumSize * aspect / 2;
    this.camera.right = this.frustumSize * aspect / 2;
    this.camera.top = this.frustumSize / 2;
    this.camera.bottom = - this.frustumSize / 2;

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  @HostListener('mousemove', ['$event']) mousemove(event: MouseEvent): void {
    this.mousePos = new Vector2(event.clientX, event.clientY);

    this.pointer = new Vector2(
      ( event.clientX / window.innerWidth ) * 2 - 1,
      - ( event.clientY / window.innerHeight ) * 2 + 1
    );

    this.raycaster.setFromCamera(this.mousePos, this.camera);
    this.raycaster.intersectObject(this.scene, true)
    this.cubeList.forEach(box => {
      var intersects = [];
      intersects = this.raycaster.intersectObject(box);
      if (intersects.length !== 0) {
        console.log('hover');
      }
    })
  }

  ngOnInit(): void {
    this.loadObj();
    this.animate();
  }

  private setMousePosCss(): void {
    if (!this.mousePos) {
      return;
    }
    this.mouseDotNowPos = this.mouseDotNowPos || this.mousePos;
    this.mouseDotNowPos.x += (this.mousePos.x - this.mouseDotNowPos.x) * this.speed;
    this.mouseDotNowPos.y += (this.mousePos.y - this.mouseDotNowPos.y) * this.speed;
    this.mousePosCss = {
      transform: `translate(calc(${this.mouseDotNowPos.x}px - 50%), calc(${this.mouseDotNowPos.y}px - 50%))`
    };
  }

  private loadObj(): void {
    const materiallBase: MeshStandardMaterialParameters = {
      roughness: 1,
      metalness: 0,
      color: 0x666666,
      fog: true,
      flatShading: false
    };
    this.objLoader.load('/assets/obj/test-icon-2.obj', (obj) => {
      const texture = this.textureLoader.load('/assets/image/web-img425-1.png');
      const material2 = new MeshPhysicalMaterial({
        ...materiallBase,
        map: texture
      });
      const oldGeometry = (obj.children[0] as Mesh).geometry;
      delete oldGeometry.attributes['normal'];
      const geometry = BufferGeometryUtils.mergeVertices(oldGeometry);
      geometry.computeVertexNormals();
      const s = 0.2;
      const triangle = new Mesh(geometry, material2);
      geometry.rotateX(Math.PI / 2);
      geometry.scale(s, s, s);
      triangle.position.setX(0.7);
      this.setUVMap(triangle);
      this.scene.add(triangle);
      this.cubeList.push(triangle);
      console.log('triangle', triangle);
    });

    const geometry = new RoundedBoxGeometry(1, 1, 0.2, 7, 0.1);
    const texture = this.textureLoader.load('/assets/image/web-icon-5-1.png');
    const material1 = new MeshPhysicalMaterial({
      ...materiallBase,
      map: texture
    });
    const material2 = new MeshPhysicalMaterial(materiallBase);
    const rect = new Mesh(geometry, [material1, material2]);

    geometry.groups[0].materialIndex = 1;
    geometry.groups[1].materialIndex = 1;
    geometry.groups[2].materialIndex = 1;
    geometry.groups[3].materialIndex = 1;
    geometry.groups[4].materialIndex = 0;
    geometry.groups[5].materialIndex = 1;
    rect.position.setX(-0.7);
    rect.position.setZ(0.1);
    this.scene.add(rect);
    this.cubeList.push(rect);
    console.log('rect', rect);
  }

  private checkHover(): void {
    if (!this.pointer || !this.camera) {
      return;
    }
    this.raycaster.setFromCamera( this.pointer, this.camera );
    const intersects = this.raycaster.intersectObjects( this.scene.children, false );
    if ( intersects.length > 0 ) {
      if ( this.INTERSECTED != intersects[ 0 ].object ) {
        this.INTERSECTED = intersects[ 0 ].object;
      }
    } else {
      this.INTERSECTED = null;
    }
  }

  private setUVMap(mesh: Mesh): void {
    const box = {
      min: { x:0, z:0 },
      max: { x:0, z:0 },
    };
    const position = mesh.geometry.getAttribute('position');

    for (let i = 0; i < position.array.length / 3; i++) {
      box.min.x = Math.min(box.min.x, position.getX(i));
      box.min.z = Math.min(box.min.z, position.getZ(i));
      box.max.x = Math.max(box.max.x, position.getX(i));
      box.max.z = Math.max(box.max.z, position.getZ(i));
    }
    const xSize = Math.abs(box.max.x - box.min.x);
    const zSize = Math.abs(box.max.z - box.min.z);
    const uv = mesh.geometry.getAttribute('uv');

    for (let i = 0; i < position.array.length / 3; i++) {
      const posX = position.getX(i);
      const posZ = position.getZ(i);
      uv.setX(i, (posX - box.min.x) / xSize);
      uv.setZ(i, (posZ - box.min.z) / zSize);
    }
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.setMousePosCss();
    this.checkHover();
    this.calcRotate();
    this.renderer.render(this.scene, this.camera);
  }

  private calcRotate(): void {
    if (!this.mousePos) {
      return;
    }
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const mouseX = this.mousePos.x - centerX;
    const mouseY = this.mousePos.y - centerY;
    const maxRotate = 0.2;
    this.cubeList.forEach(obj => {
      obj.rotation.set(
        obj.rotation.x + (mouseY * maxRotate / centerY - obj.rotation.x) * this.speed,
        obj.rotation.y + (mouseX * maxRotate / centerX - obj.rotation.y) * this.speed,
        0
      )
    })
  }

  private getVector(num: number): number {
    if (num < 0) {
      return -1;
    }
    return 1;
  }


}
