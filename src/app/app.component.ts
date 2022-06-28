import { Component, ElementRef } from '@angular/core';
import { BufferGeometry, DoubleSide, Float32BufferAttribute, MeshBasicMaterial, PerspectiveCamera, Scene, TextureLoader, Vector3, WebGLRenderer } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';


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
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // this.geometry = new THREE.BoxGeometry(1, 1, 1);
    // this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // this.cube = new THREE.Mesh(this.geometry, this.material);
    // this.scene.add(this.cube);

    this.camera.position.z = 5;
    this.el.nativeElement.appendChild(this.renderer.domElement);
  }

  private readonly objLoader: OBJLoader = new OBJLoader();
  private readonly textureLoader: TextureLoader = new TextureLoader();
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  // private geometry: THREE.BoxGeometry;
  // private material: THREE.MeshBasicMaterial;
  private cube!: THREE.Group;

  ngOnInit(): void {
    this.loadObj();
    this.animate();
  }

  private loadObj(): void {
    this.objLoader.load(
      "/assets/obj/test-icon-1.obj",
      // onLoad callback
      (obj) => {
        this.cube = obj;
        console.log(obj);
        obj.rotateX(90);
        obj.children.forEach((child) => {
          const mesh = (child as THREE.Mesh);
          const geom = mesh.geometry
          const texture = this.textureLoader.load('/assets/image/web-icon-5.png');
          const material1 = new MeshBasicMaterial({
            color: 0xffffff,
            map: texture,
            side: DoubleSide

          });
          const material2 = new MeshBasicMaterial({
            color: 0xff2244,
            // map: texture,
            side: DoubleSide
          });
          console.log(texture);
          (window as any).texture = texture;
          // texture.offset.set( 1, 1 );
					texture.repeat.set( 1, 1 );
					// texture.center.set( 1, 1 );


          const uv = [];
          for (let i = 0, max = geom.attributes['uv'].array.length / 3; i < max; i++) {
            if (i === 4) {
              geom.addGroup(12, 6, 0);
              if (1) {
                uv.push(
                  0.1,
                  0.5,
                  0.7,
                  0.5,
                  0.7,
                  0.9,
                )
              } else {
                uv.push(
                  geom.attributes['uv'].array[12],
                  geom.attributes['uv'].array[13],
                  geom.attributes['uv'].array[14],
                  geom.attributes['uv'].array[15],
                  geom.attributes['uv'].array[16],
                  geom.attributes['uv'].array[17],
                )
              }
              console.log(
                geom.attributes['uv'].array[12],
                geom.attributes['uv'].array[13],
                geom.attributes['uv'].array[14],
                geom.attributes['uv'].array[15],
                geom.attributes['uv'].array[16],
                geom.attributes['uv'].array[17],

              );

            } else if (i !== 5) {
              uv.push(
                geom.attributes['uv'].array[i * 3],
                geom.attributes['uv'].array[i * 3 + 1],
                geom.attributes['uv'].array[i * 3 + 2],
              )
              geom.addGroup(i * 3, 3, 1);
            }
          }
          geom.setAttribute("uv", new Float32BufferAttribute(uv, 2));
          mesh.material = [material1, material2];
          // mesh.material = material1;
        });
        this.scene.add(obj);
      }
    );
    // this.objLoader.load(
    //   "/assets/obj/test-icon-2.obj",
    //   // onLoad callback
    //   (obj) => {
    //     console.log(obj)
    //     this.scene.add(obj);
    //   },

    //   // onProgress callback
    //   (xhr) => {
    //     console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    //   },

    //   // onError callback
    //   (err) => {
    //     console.error('An error happened');
    //   }
    // );
  }

  private animate() {
    requestAnimationFrame(() => this.animate());

    if (this.cube) {

      // this.cube.rotation.x += 0.01;
      // this.cube.rotation.y += 0.01;
    }

    this.renderer.render(this.scene, this.camera);
  };
}
