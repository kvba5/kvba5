import { type SequenceAnimatorOptions } from "./terminal/animator";
import SequenceAnimator from "./terminal/animator";
import { FrameType, type Frame } from "./terminal/types";

type SequenceBuilderOptions = {
    animator?: Partial<SequenceAnimatorOptions>
}

export default class SequenceBuilder {
    private options: SequenceBuilderOptions;
    private frames: Frame[] = []

    constructor(options?: Partial<SequenceBuilderOptions>) {
        this.options = {
            ...options
        }
    }

    /** Builds cumulated frames into webp animation */
    build() {
        return new SequenceAnimator(this.frames, this.options.animator)
            .animate()
    }

    /** Sets speed of typing */
    setSpeed(speed: number) { this.frames.push([FrameType.SET_SPEED, speed]); return this }
    /** Waits amount of milliseconds */
    wait(time: number) { this.frames.push([FrameType.WAIT, time]); return this }
    /** Types text in a speed set with setSpeed (or default - 1) */
    type(text: string) { this.frames.push([FrameType.TYPE, text]); return this }
    /** Appends text in front of a cursor */
    appendText(text: string) { this.frames.push([FrameType.APPEND_TEXT, text]); return this }
    /** Pushes cursor `n` lines down */
    pushDown(n: number = 1) { this.frames.push([FrameType.PUSH_DOWN, n]); return this }
    /** Clears text from terminal */
    clear() { this.frames.push([FrameType.CLEAR, null]); return this }
    prompt(bool: boolean) { this.frames.push([FrameType.TOGGLE_PROMPT, bool]); return this }
}