import { Clock } from "three";

export interface AnimatedEntity {
    update(clock: Clock): void;
}

export class Scheduler {
    private schedule: AnimatedEntity[] = [];

    public add(entity: AnimatedEntity): Scheduler {
        this.schedule.push(entity);
        return this;
    }

    public doUpdates(clock: Clock): void {
        for (const entity of this.schedule) {
            entity.update(clock);
        }
    }
}