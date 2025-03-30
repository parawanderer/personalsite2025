import { Queue as OldQueue } from "@datastructures-js/queue";

interface IterationResult<T> {
    done: boolean;
    value?: T;
}

class QueueIterator<T> {
    private size: number;
    private nextElement: number = 0;

    constructor(private q: Queue<T>) {
        this.size = q.size();
    }

    /**
     * bleh, this should be changed to handle `continue` or `break` in the middle better.
     * I didn't need this for my use-case but I see now that this is a broken implementation
     * when it comes to that....
     */
    public next(): IterationResult<T> {
        if (this.nextElement === this.size) {
            return {
                done: true
            };
        }

        const next: T = this.q.pop();
        this.q.push(next); // add back to back
        this.nextElement++;

        return {
            done: false,
            value: next
        };
    }
}

export class Queue<T> extends OldQueue<T> {
    /**
     * Extend to allow iteration. Can't allow modification while iterating, though
     */
    [Symbol.iterator]() {
        return new QueueIterator(this);
    }
}