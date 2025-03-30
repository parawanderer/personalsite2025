import gsap from "gsap";
import { Camera, Vector3 } from "three";

const ANIMATE_DURATION_SECS = 2;
const EASE = "power2.inOut";

export const moveCameraTo = (camera: Camera, targetPosition: Vector3, targetLookAt: Vector3, durationSecs: number = ANIMATE_DURATION_SECS) => {
    if (camera.position.equals(targetPosition)) {
        console.log("No need to move camera as already at target position!");
        return; // nothing to do
    }

    const currentLookAt = new Vector3();
    camera.getWorldDirection(currentLookAt);
    currentLookAt.add(camera.position);


    gsap.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: durationSecs,
        ease: EASE,
        onUpdate: () => {
            //camera.lookAt(targetLookAt);
        }
    });

    gsap.to(currentLookAt, {
        x: targetLookAt.x,
        y: targetLookAt.y,
        z: targetLookAt.z,
        duration: durationSecs,
        ease: EASE,
        onUpdate: () => {
            camera.lookAt(currentLookAt);
        }
    });
};