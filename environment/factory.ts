
import {
    Scene,
    HemisphereLight,
    SpotLight,
    PointLight,
    SphereGeometry,
    TextureLoader,
    MeshBasicMaterial,
    Mesh,
    Object3DEventMap,
    BoxGeometry,
    TorusGeometry,
    PlaneGeometry,
    DoubleSide,
    Color,
    MeshPhysicalMaterial,
    LoadingManager
} from 'three';

import {
    AMBIENT_LIGHT_SKY_COLOR,
    AMBIENT_LIGHT_GROUND_COLOR,
    AMBIENT_LIGHT_INTENSITY,
    CAMERA_INITIAL_Z,
    SPOTLIGHT_SKY_COLOR,
    SPOTLIGHT_SKY_INTENSITY,
    POINTLIGHT_SKY_COLOR,
    BACKGROUND_COLOR,
} from '../constants';


export class GenericObjectFactory {
    constructor(private loadingMgr: LoadingManager, private scene: Scene) {}

    public makeCube(color: number): Mesh<BoxGeometry, MeshBasicMaterial, Object3DEventMap> {
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshBasicMaterial( {
            color: color,
            fog: false
        });
        material.color = material.color.multiplyScalar(1.305);
        const cube = new Mesh(geometry, material);
        this.scene.add(cube);

        return cube;
    }

    public makeGlassPane(color: number) {
        const geometry = new BoxGeometry(1, 1, 0.01);
        const material = new MeshPhysicalMaterial({
            color: 0xffffff,
            transmission: 1,
            roughness: 0.2,
            metalness: 0,
            ior: 1.8,
            thickness: 0.5
        });
        const pane = new Mesh(geometry, material);
        this.scene.add(pane);

        return pane;
    }

    public makeAmbientLight(): HemisphereLight {
        const light = new HemisphereLight(
            AMBIENT_LIGHT_SKY_COLOR,
            AMBIENT_LIGHT_GROUND_COLOR,
            AMBIENT_LIGHT_INTENSITY
        );
        this.scene.add(light);
        return light;
    }

    public makeSkySpotLight(): SpotLight {
        const color = SPOTLIGHT_SKY_COLOR;
        const intensity = SPOTLIGHT_SKY_INTENSITY;
        const light = new SpotLight(color, intensity);
        light.position.set(0, 7, -9.2);
        light.target.position.set(0, 0, CAMERA_INITIAL_Z);
        light.castShadow = true;

        this.scene.add(light);
        this.scene.add(light.target);

        // const helper = new DirectionalLightHelper(light);
        // scene.add(helper);
        return light;
    }

    public makeSkyDiffuseLight(x: number, y: number, z: number, intensity: number = 800): PointLight {
        const light = new PointLight(POINTLIGHT_SKY_COLOR, intensity);
        light.position.set(x, y, z);
        this.scene.add(light);

        // const helper = new PointLightHelper(light);
        // scene.add(helper);
        return light;
    }

    public makeObjectLight(x: number, y: number, z: number, intensity: number = 800, color: number): PointLight {
        const light = new PointLight(color, intensity, 20);
        light.position.set(x, y, z);
        this.scene.add(light);

        // const helper = new PointLightHelper(light);
        // scene.add(helper);
        return light;
    }

    public makeSkybox(texturePath: string): Mesh<SphereGeometry, MeshBasicMaterial, Object3DEventMap> {
        const geometry = new SphereGeometry(120, 60, 40);
        geometry.scale(-1, 1, 1); // invert the geometry on the x-axis so that all of the faces point inward
        const texture = new TextureLoader().load(texturePath);
        //texture.colorSpace = SRGBColorSpace;
        const material = new MeshBasicMaterial({
            //map: texture,
            fog: false,
            color: new Color(BACKGROUND_COLOR)
        });

        const mesh = new Mesh(geometry, material);

        this.scene.add(mesh);

        return mesh;
    }

    public makeRing(radius: number, tube: number, color: number) {
        const geometry = new TorusGeometry(radius, tube, 16, 60);
        const material = new MeshBasicMaterial({
            color,
            fog: false
        });
        material.color = material.color.multiplyScalar(1.002);
        const torus = new Mesh(geometry, material);
        this.scene.add(torus);

        return torus;
    };

    public makeBackgroundPlane(offsetZ: number) {
        const background = new Mesh(
            new PlaneGeometry(100, 100),
            new MeshBasicMaterial({
                color: BACKGROUND_COLOR,
                side: DoubleSide,
                fog: false
            })
        );
        background.position.set(0, 0, offsetZ);
        this.scene.add(background);

        return background;
    };
}