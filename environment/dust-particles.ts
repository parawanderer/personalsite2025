import { AnimatedEntity } from "entity/animated-entity";
import { Camera, Clock, DoubleSide, InstancedBufferAttribute, InstancedMesh, LoadingManager, Matrix4, Mesh, MeshBasicMaterial, Object3DEventMap, PlaneGeometry, Quaternion, Scene, Vector3 } from "three";
import { randFloat } from "three/src/math/MathUtils.js";
import { Queue } from "../utils/datastructures";
import { getTexture } from "../utils/texture-utils";
import { fragment, fragmentPars, vertex, vertexPars } from "../shaders/particle-with-opacity.glsl";
import { insertModifications } from "../shaders/util";


const UNITS_PER_MS_REGULAR = 10/1000;
const MOVEMENT_MULTIPLIER = 1/5000;

class DustParticle {
    constructor(
        public velocity: Vector3,
        public pos: Vector3,
        public birthTime: number,
        public index: number,
        public opacity: number
    ) {}

    public replace(velocity: Vector3, pos: Vector3, birthTime: number, opacity: number): DustParticle {
        this.pos = pos;
        this.velocity = velocity;
        this.birthTime = birthTime;
        this.opacity = opacity;

        return this;
    }

    public update(diff: number): void {
        this.updatePos(diff);
        this.updateOpacity(diff);
    }

    protected updatePos(diff: number): void {
        const add = this.velocity.clone().multiplyScalar(diff);
        const newPos = this.pos.clone().add(add);
        this.pos = newPos;
    }

    protected updateOpacity(diff: number): void {
        this.opacity = Math.min(1.0, (this.opacity + diff/2000));
    }
}

interface SpawnConfig {
    pos: Vector3;
    velocity: Vector3;
    opacity: number;
}

export class DustEmitter implements AnimatedEntity {
    private lastTime: number = 0;
    private lastUnitAddingTime: number = 0;
    private fifoUnits: Queue<DustParticle> = new Queue();

    private geometry: PlaneGeometry;
    private material: MeshBasicMaterial;
    private instancedMesh: InstancedMesh;

    constructor(
        public texturePath: string,
        private pos: Vector3,
        private spawnRadius: number,
        private scene: Scene,
        private camera: Camera,
        private maxAmount: number,
        private dustSize: number,
        private initialOpacity: number,
        private rateOfUnitAdding: number,
        private spawnInitially?: number
    ) {
        this.geometry = new PlaneGeometry(
            this.dustSize,
            this.dustSize
        );
        this.material = new MeshBasicMaterial({
            map: getTexture(texturePath),
            transparent: true,
            side: DoubleSide,
        });
        this.material.onBeforeCompile = (shader) => {
            // TRACKS: https://github.com/mrdoob/three.js/blob/master/src/renderers/shaders/ShaderLib/meshbasic.glsl.js
            insertModifications(shader, {
                vertexPars: {
                    insertAfter: `#include <clipping_planes_pars_vertex>`,
                    content: vertexPars
                },
                vertexMain: {
                    insertAfter: `#include <fog_vertex>`,
                    content: vertex
                },
                fragmentPars: {
                    insertAfter: `#include <clipping_planes_pars_fragment>`,
                    content: fragmentPars
                },
                fragmentMain: {
                    insertAfter: `#include <dithering_fragment>`,
                    content: fragment
                }
            });
        };

        this.instancedMesh = new InstancedMesh(this.geometry, this.material, this.maxAmount);
        //this.instancedMesh.frustumCulled = false;
        this.instancedMesh.geometry.computeBoundingSphere();
        this.instancedMesh.geometry.boundingSphere!.radius = 10;
        this.scene.add(this.instancedMesh);

        const opacities = new Float32Array(this.maxAmount);
        for (let i = 0; i < this.maxAmount; i++) {
            opacities[i] = this.initialOpacity;
        }

        this.geometry.setAttribute('instanceOpacity', new InstancedBufferAttribute(opacities, 1));
    }

    protected getLastTime(): number {
        return this.lastTime;
    }

    protected getPos(): Vector3 {
        return this.pos;
    }

    public update(clock: Clock): void {
       this.addNew(clock);
       this.updatePositions(clock);
       this.lastTime = clock.oldTime;
    }

    private updatePositions(clock: Clock) {
        const diff = clock.oldTime - this.lastTime;
        const opacities = this.instancedMesh.geometry.getAttribute('instanceOpacity');

        for (const particle of this.fifoUnits) {
            particle!.update(diff);

            const matrix = new Matrix4();
            matrix.compose(particle!.pos, this.camera.quaternion, new Vector3(1, 1, 1));

            this.instancedMesh.setMatrixAt(particle!.index, matrix);
            opacities.setX(particle!.index, particle!.opacity);
        }

        this.instancedMesh.instanceMatrix.needsUpdate = true;
        opacities.needsUpdate = true;
    }

    protected getNewSpawnConfig(): SpawnConfig {
        const pos = new Vector3(
            this.pos.x + randFloat(-this.spawnRadius, this.spawnRadius),
            this.pos.y + randFloat(-this.spawnRadius, this.spawnRadius),
            this.pos.z + randFloat(-this.spawnRadius, this.spawnRadius),
        );
        const velocity = new Vector3(randFloat(-0.5, 0.5), randFloat(-1, -0.1), randFloat(-0.5, 0.5))
            .multiplyScalar(MOVEMENT_MULTIPLIER);

        return { pos, velocity, opacity: 0.0 };
    }

    private getUnitsToAdd(clock: Clock): number {
        if (this.lastUnitAddingTime === 0 && this.spawnInitially) {
            return this.spawnInitially;
        }
        const diff = clock.oldTime - this.lastUnitAddingTime;
        return Math.min(Math.floor(this.rateOfUnitAdding * diff), this.maxAmount);
    }

    private addNew(clock: Clock): void {
        const unitsToAdd = this.getUnitsToAdd(clock);

        if (unitsToAdd <= 0) return;

        for (let i = 0; i < unitsToAdd; ++i) {
            const { pos, velocity, opacity } = this.getNewSpawnConfig();

            if (this.fifoUnits.size() == this.maxAmount) {
                // reuse last to first
                const particle = this.fifoUnits.pop();
                particle.replace(velocity, pos, clock.oldTime, opacity);
                this.fifoUnits.push(particle); // move to front as "newest"

            } else {
                // add new
                const particle = new DustParticle(
                    velocity,
                    pos,
                    clock.oldTime,
                    this.fifoUnits.size(),
                    opacity
                );

                this.fifoUnits.push(particle);
            }
        }

        this.instancedMesh.count = this.fifoUnits.size();
        this.lastUnitAddingTime = clock.oldTime;
    }

    public setPos(pos: Vector3): void {
        this.pos = pos;
    }
}

const getPosForTime = (time: number, rotationRadius: number): Vector3 => {
    return new Vector3(
        Math.cos(time) * rotationRadius,
        Math.sin(time) * rotationRadius,
        0
    );
}

const getVelocityOnCircle = (circlePos: Vector3) => {
    return circlePos.clone().cross(new Vector3(0, 0, 1)).normalize().multiplyScalar(MOVEMENT_MULTIPLIER);
};

const ROTATION_SPEED = 1;

const UNITS_PER_MS_CIRCULAR = 20/1000;

export class RotatingDustEmitter extends DustEmitter {
    private circlePos: Vector3;
    private circleVelocity: Vector3;

    constructor(
        texturePath: string,
        private centerPos: Vector3,
        private rotationRadius: number,
        scene: Scene,
        camera: Camera,
        maxAmount: number,
        dustSize: number
    ) {
        super(
            texturePath,
            getPosForTime(0.0, rotationRadius).add(centerPos),
            0.001,
            scene,
            camera,
            maxAmount,
            dustSize,
            1.0,
            UNITS_PER_MS_CIRCULAR
        );
        this.circlePos = getPosForTime(0.0, rotationRadius);
        this.circleVelocity = getVelocityOnCircle(this.circlePos);
    }

    public setPos(pos: Vector3): void {
        this.centerPos = pos;

        this.circlePos = getPosForTime(this.getLastTime() * ROTATION_SPEED, this.rotationRadius);
        this.circleVelocity = getVelocityOnCircle(this.circlePos);

        super.setPos(this.circlePos.clone().add(this.centerPos));
    }

    protected getNewSpawnConfig(): SpawnConfig {
        const circlePos = this.getPos();

        const pos = circlePos.clone();

        const gravityAndRandomDisplacementVelocity = new Vector3(
            randFloat(-0.1, 0.1),
            randFloat(-1, -0.1),
            randFloat(-0.1, 0.1)
        ).multiplyScalar(MOVEMENT_MULTIPLIER);


        const velocity = gravityAndRandomDisplacementVelocity.add(this.circleVelocity);

        return { pos, velocity, opacity: 1.0 };
    }


    public update(clock: Clock): void {
        this.circlePos = getPosForTime(clock.elapsedTime * ROTATION_SPEED, this.rotationRadius);
        this.circleVelocity = getVelocityOnCircle(this.circlePos);

        super.setPos(this.circlePos.clone().add(this.centerPos));

        super.update(clock);
    }
}

export class DustFactory {
    constructor(private loadingMgr: LoadingManager, private scene: Scene, private camera: Camera) {}

    public makeDust(
        texturePath: string,
        pos: Vector3,
        spawnRadius: number,
        maxAmount: number,
        dustSize: number,
        initialSpawn: number
    ): DustEmitter {
        const emitter = new DustEmitter(
            texturePath,
            pos,
            spawnRadius,
            this.scene,
            this.camera,
            maxAmount,
            dustSize,
            0.0,
            UNITS_PER_MS_REGULAR,
            initialSpawn
        );

        return emitter;
    }

    public makeRotatingDust(
        texturePath: string,
        pos: Vector3,
        rotationRadius: number,
        maxAmount: number,
        dustSize: number
    ): DustEmitter {
        const emitter = new RotatingDustEmitter(
            texturePath,
            pos,
            rotationRadius,
            this.scene,
            this.camera,
            maxAmount,
            dustSize
        );

        return emitter;
    }
}