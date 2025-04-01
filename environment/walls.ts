import { Queue } from '@datastructures-js/queue';

import { BufferGeometry, Clock, CylinderGeometry, LoadingManager, Mesh, MeshPhysicalMaterial, Object3DEventMap, RepeatWrapping, Scene, SRGBColorSpace } from 'three';
import { degToRad, randFloat, randInt } from 'three/src/math/MathUtils.js';

import { CAMERA_INITIAL_Z, FOG_UPDATE_BY, FOG_UPDATE_EVERY_MS, PILLARS_FOG_FAR_COLOR, PILLARS_FOG_NEAR_COLOR, PILLARS_FOG_NOISE_FREQ, PILLARS_FOG_NOISE_IMPACT, PILLARS_FOG_NOISE_SPEED, PILLARS_GEOGRAPHY_MAP, ROW_LENGTH_X, ROW_LENGTH_Z, SCALE_FACTOR, WALLS_OFFSET  } from '../constants';
import { loadImage, pixelPosOffsetPNG } from '../utils/image-utils';
import { getPBRMaterialTextures, PLACEHOLDER } from '../utils/texture-utils';
import { customFogExtension, ShaderExtension } from './animated-fog';
import { fogFrag, fogParsFrag, fogParsVert, fogVert } from "../shaders/fogedits.glsl";
import { AnimatedEntity } from '../entity/animated-entity';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';


const UNPOPULATED = 0.0;
const VISITED = -2.0;
const INACCESSIBLE = -1.0;
const RADIUS = 0.1;
const BASE_ANGLE_X = degToRad(35);
const ANGLE_VARIANCE_X = degToRad(10);
const ANGLE_SELF_ROTATE = degToRad(10); // literally any rotation around Y
const ANGLE_VARIANCE_Y_MIN = degToRad(-15);
const ANGLE_VARIANCE_Y_MAX = degToRad(15);
const ANGLE_VARIANCE_Z_MIN = degToRad(-1);
const ANGLE_VARIANCE_Z_MAX = degToRad(1);
const CYLINDER_RADIAL_SEGMENTS_HEXAGON = 6;


interface QueueElement {
    i: number;
    j: number;
    distance?: number;
}


const getNeighbors = (i: number, j: number, matrix: number[][]): QueueElement[] => {
    const res: QueueElement[] = [];
    if (i >= 0 && i < matrix.length - 1) {
        res.push({i : i + 1, j});
    }
    if (i > 0) {
        res.push({i : i - 1, j});
    }
    if (j >= 0 && j < matrix[0].length - 1) {
        res.push({i, j: j + 1});
    }
    if (j > 0) {
        res.push({i, j: j - 1});
    }
    return res;
}


const createMapTemplateGeneric = (): Promise<number[][]> => {
    const width = 2*ROW_LENGTH_X + 2*WALLS_OFFSET;
    const depth = CAMERA_INITIAL_Z + ROW_LENGTH_Z;

    // init
    const grid: number[][] = new Array(width);
    for (let i = 0; i < width; ++i) {
        grid[i] = new Array(depth).fill(UNPOPULATED);
    }

    // mark "central" area as inaccessible

    const inaccessibleArea = 2*WALLS_OFFSET;
    for (let i = 0; i < inaccessibleArea; ++i) {
        for (let j = 0; j < depth; ++j) {
            grid[ROW_LENGTH_X + i][j] = INACCESSIBLE;
        }
    }

    return Promise.resolve(grid);
}


/**
 * Converts png image to pillar height map
 */
const parseMapTemplate = async (path: string): Promise<number[][]> => {
    const image = await loadImage(path);

    const canvas: HTMLCanvasElement = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx === null) throw new Error("Failed to create 2D context!");

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);

    const imageData: ImageData = ctx.getImageData(0, 0, image.width, image.height);

    const grid: number[][] = new Array(image.width);
    for (let i = 0; i < image.width; ++i) {
        grid[i] = new Array(image.height).fill(UNPOPULATED);
        for (let j = 0; j < image.height; ++j) {

            const index = pixelPosOffsetPNG(image.width, j, i);
            const a = imageData.data[index + 3];

            grid[i][j] = a === 0 ? INACCESSIBLE : UNPOPULATED;
        }
    }

    return grid;
}


const createRandomColumnsHeightMap = async () : Promise<number[][]> => {
    //const grid = createMapTemplateBasic();
    const grid: number[][] = await parseMapTemplate(PILLARS_GEOGRAPHY_MAP);

    // do: BFS random fill based on some rules that look nice
    // general idea is to "grow outwards" and give pillars a random height
    // based on how far away they are from the inaccessible "water" area
    const q = new Queue<QueueElement>();
    for (let i = 0; i < grid.length; ++i) {
        for (let j = 0; j < grid[0].length; ++j) {
            if (grid[i][j] === INACCESSIBLE) {
                q.push({i, j, distance: -1});
            }
        }
    }

    // basic BFS
    while (q.size() > 0) {
        const {i, j, distance} = q.pop();
        const neighbors: QueueElement[] = getNeighbors(i, j, grid);

        if (distance !== -1) {
            // only generate a height for non-"water" slots
            grid[i][j] = getHeightForDistance(distance!);
        }

        for (const neighbor of neighbors) {
            if (grid[neighbor.i][neighbor.j] === UNPOPULATED) {
                grid[neighbor.i][neighbor.j] = VISITED;
                q.push({i: neighbor.i, j: neighbor.j, distance: distance! + 1});
            }
        }

    }

    return grid;
}

export class Walls implements AnimatedEntity {
    private lastFogUpdate: number = 0;

    constructor(private readonly width: number, private readonly depth: number, private walls: Mesh<BufferGeometry, MeshPhysicalMaterial, Object3DEventMap>, private fog: ShaderExtension) {}

    public update(clock: Clock): void {
        const uniforms = this.fog.getUniforms();
        if (!uniforms) return;

        if (clock.oldTime - this.lastFogUpdate >= FOG_UPDATE_EVERY_MS) {
            uniforms['fogTime'].value += FOG_UPDATE_BY;
            this.lastFogUpdate = clock.oldTime;
        }
    }
}

export class WallsFactory {
    constructor(private loadingMgr: LoadingManager, private scene: Scene) {}

    public async makeWalls(extraOffsetZ: number): Promise<Walls> {
        const geometry = new CylinderGeometry(RADIUS, RADIUS, 1, CYLINDER_RADIAL_SEGMENTS_HEXAGON);

        const materialTextures = getPBRMaterialTextures(
            `storm_marble_2-1K/1K_storm___honed___marble_2_${PLACEHOLDER}.png`,
            {
                wrapS: RepeatWrapping,
                wrapT: RepeatWrapping,
                colorSpace: SRGBColorSpace
            }
        );

        const material: MeshPhysicalMaterial = new MeshPhysicalMaterial({
            ...materialTextures,
            //clearcoat: 0.07,
            displacementScale: 0.001,
            iridescence: 0.2,
            specularIntensity: 1.0,
            metalness: 0.3,
            flatShading: true // force appearance to not get rounded to get proper hexagons
        });

        const fogShader: ShaderExtension = customFogExtension({
            fogNearColor: PILLARS_FOG_NEAR_COLOR,
            fogFarColor: PILLARS_FOG_FAR_COLOR,
            fogNoiseFreq: PILLARS_FOG_NOISE_FREQ,
            fogNoiseImpact: PILLARS_FOG_NOISE_IMPACT,
            fogTime: 0,
            fogNoiseSpeed: PILLARS_FOG_NOISE_SPEED,
            fogFrag,
            fogParsFrag,
            fogParsVert,
            fogVert
        });

        material.onBeforeCompile = fogShader.handle;

        const grid = await createRandomColumnsHeightMap();

        const geometries: CylinderGeometry[] = [];

        const plannedWidth = grid.length*SCALE_FACTOR;
        const plannedDepth = grid[0].length*SCALE_FACTOR;

        const offsetX = -plannedWidth/2;
        const offsetZ = extraOffsetZ - plannedDepth;

        for (let i = 0; i < grid.length; ++i) {
            for (let j = 0; j < grid[0].length; ++j) {
                if (grid[i][j] <= 0.0) continue;
                const requiredHeight = grid[i][j];

                const instanceGeo = geometry.clone();

                instanceGeo.rotateY(randFloat(0, ANGLE_SELF_ROTATE));

                instanceGeo.scale(1, requiredHeight, 1);

                instanceGeo.rotateY(randFloat(ANGLE_VARIANCE_Y_MIN, ANGLE_VARIANCE_Y_MAX));
                instanceGeo.rotateX(BASE_ANGLE_X + randFloat(0, ANGLE_VARIANCE_X));
                instanceGeo.rotateZ(randFloat(ANGLE_VARIANCE_Z_MIN, ANGLE_VARIANCE_Z_MAX));

                instanceGeo.translate(
                    (i*SCALE_FACTOR) + offsetX,
                    -1,
                    (j*SCALE_FACTOR) + offsetZ
                );

                geometries.push(instanceGeo);
            }
        }

        const mergedGeometry = mergeGeometries(geometries);
        const mergedMesh = new Mesh(mergedGeometry, material);
        this.scene.add(mergedMesh);

        return new Walls(
            plannedWidth,
            plannedDepth,
            mergedMesh,
            fogShader!
        );
    }
}

const getHeightDistanceOne = () => {
    if (randInt(0, 20) < 20) {
        return randFloat(0.1, 0.5);
    }
    return randFloat(1, 1.5);
};


const getHeightDistanceTwo = () => {
    const r = randInt(0, 20);
    if (r <= 1) {
        return randFloat(0.5, 0.75);
    }

    if (r < 20) {
        return randFloat(0.75, 1.0);
    }

    return randFloat(1.5, 3);
};


const getHeightDistanceThree = () => {
    const r = randInt(0, 20);
    if (r <= 4) {
        return randFloat(0.75, 1.0);
    }

    return randFloat(1.5, 3);
}


const getHeightDistanceX = () => {
    return randFloat(3, 8);
}


const getHeightForDistance = (distance: number): number => {
    if (distance <= 1) {
        return getHeightDistanceOne();
    }
    if (distance <= 2) {
        return getHeightDistanceTwo();
    }
    if (distance <= 3) {
        return getHeightDistanceThree();
    }
    return getHeightDistanceX();
};