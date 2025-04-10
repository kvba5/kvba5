export enum FrameType {
    WAIT,
    SET_SPEED,
    TYPE,
    APPEND_TEXT,
    CLEAR,
    PUSH_DOWN,
    TOGGLE_PROMPT
}

type FrameData<T extends FrameType> = T extends (FrameType.WAIT | FrameType.SET_SPEED | FrameType.PUSH_DOWN) ? number :
    T extends (FrameType.TYPE | FrameType.APPEND_TEXT) ? string :
    T extends FrameType.CLEAR ? null :
    T extends FrameType.TOGGLE_PROMPT ? boolean : never

export type Frame = { [T in FrameType]: [T, FrameData<T>] }[FrameType];