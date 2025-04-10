import theme from "../../theme.toml"

import { type Canvas, createCanvas, registerFont } from "canvas";
import { FrameType, type Frame } from "./types";
import { join } from "path"
import { appendFileSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "fs";
import { spawn, spawnSync } from "bun";

export type SequenceAnimatorOptions = {
    width: number,
    height: number,
    prompt: string
}

export default class SequenceAnimator {
    private static readonly FRAME_SAVE_PATH = join(process.cwd(), "_frametmp")
    private static readonly FRAME_SEQUENCE_PATH = join(this.FRAME_SAVE_PATH, "sequence.txt")
    private static readonly TERMINAL_FONT = (() => {
        const fileName = readdirSync(process.cwd())
            .filter(n => n.endsWith(".ttf"))
            .pop()
        
        if (!fileName) return "Arial"
        
        const fontName = fileName.split(".").shift()!
        registerFont(join(process.cwd(), fileName), { family: fontName })
        return fontName;
    })()
    private static readonly FONT_SIZE = 18
    private static readonly CURSOR_CHAR = "█"
    private static readonly LASTLINE_REGEX = /(\n|^)(.*?)$/
    private static readonly COLOR_REGEX = /%(?:(b)_)?([a-z]+)%/gm

    options: SequenceAnimatorOptions
    private frameIndex: number = 0;
    private frames: Frame[]
    private currentText: string = ""
    private typeSpeed: number = 1;
    private currentlyTyping: string[] = [];
    private showPrompt: boolean = false;

    canvas: Canvas;
    get ctx() { return this.canvas.getContext("2d") }

    constructor(frames: Frame[], options?: Partial<SequenceAnimatorOptions>) {
        if (frames.length === 0) throw new Error("No frames provided!")

        this.options = {
            width: 750,
            height: 500,
            prompt: "> ",
            ...options
        }
        this.frames = frames;
        this.canvas = createCanvas(this.options.width, this.options.height)
        this.ctx.font = `${SequenceAnimator.FONT_SIZE}px "${SequenceAnimator.TERMINAL_FONT}"`
    }

    private parseText() {
        const matches: (string | undefined)[] = this.currentText.split(SequenceAnimator.COLOR_REGEX)
        if (matches[0] === "") matches.splice(0, 1)
        else matches.unshift(undefined, "reset")

        let chunk: (string | undefined)[] = [];
        return matches.reduce<{ bold: boolean, color: string, text: string }[]>((arr, v) => {
            chunk.push(v as any)
            if (chunk.length !== 3) return arr;

            const [boldStr, color, text] = chunk as [string | undefined, string, string];
            arr.push({
                text,
                color,
                bold: boldStr === "b"
            })
            chunk = []
            return arr
        }, [])
    }

    private renderText() {
        let text = ""
        let lastColor = ""
        const parts = this.parseText()
        for (let { bold, color, text: t } of parts) {
            if (color === "reset") this.ctx.fillStyle = theme.main.fg, bold = false
            else {
                const col = theme[bold ? "bright" : "normal"][color]
                this.ctx.fillStyle = col ?? theme.main.fg
                if (bold) this.ctx.shadowBlur = 10, this.ctx.shadowColor = col ?? theme.main.fg
            }
            const { emHeightDescent } = this.ctx.measureText(text)
            const { width } = this.ctx.measureText(text.split("\n").pop()!)
            this.ctx.fillText(
                t,
                width, emHeightDescent + SequenceAnimator.FONT_SIZE
            )
            text += t
            lastColor = color
        }

        const { emHeightDescent } = this.ctx.measureText(text)
        const { width } = this.ctx.measureText(text.split("\n").pop()!)
        this.ctx.fillStyle = theme.main.fg
        this.ctx.fillText(
            SequenceAnimator.CURSOR_CHAR,
            width, emHeightDescent + SequenceAnimator.FONT_SIZE
        )
        this.ctx.fillStyle = lastColor
    }

    private animateFrame(fileName: string): boolean {
        let delay = 100;
        if (this.currentlyTyping.length > 0) {
            this.currentText += this.currentlyTyping.pop()
            delay = delay * this.typeSpeed;
        }
        else {
            const frame = this.frames[this.frameIndex++]
            if (!frame) return false;
            const [ type, arg ] = frame;
    
            switch(type) {
                case FrameType.CLEAR: this.currentText = ""; break;
                case FrameType.APPEND_TEXT: this.currentText += arg; break;
                case FrameType.PUSH_DOWN:
                    this.currentText += "\n".repeat(arg)
                    delay = 0
                    if (this.showPrompt) this.currentText = this.currentText.replace(SequenceAnimator.LASTLINE_REGEX, `$1${this.options.prompt}$2`);
                    break;
                case FrameType.SET_SPEED: this.typeSpeed = arg; break;
                case FrameType.TYPE:
                    this.currentlyTyping = arg.split("").toReversed();
                    this.currentText += this.currentlyTyping.pop()
                    delay = delay * this.typeSpeed;
                    break;
                case FrameType.WAIT: delay = arg; break;
                case FrameType.TOGGLE_PROMPT:
                    this.showPrompt = arg;
                    if (arg) this.currentText = this.currentText.replace(SequenceAnimator.LASTLINE_REGEX, `$1${this.options.prompt}$2`)
                    break;
            }
        }

        // BG
        this.ctx.fillStyle = theme.main.bg
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        // TEXT
        this.renderText()

        writeFileSync(join(SequenceAnimator.FRAME_SAVE_PATH, fileName), this.canvas.toBuffer("image/png"))
        appendFileSync(join(SequenceAnimator.FRAME_SAVE_PATH, "sequence.txt"), `file '${fileName}'\nduration ${(delay / 1000).toFixed(4).replace(/\.?0+$/, "")}\n`)
        return true
    }

    async animate() {
        rmSync(SequenceAnimator.FRAME_SAVE_PATH, { force: true, recursive: true })
        mkdirSync(SequenceAnimator.FRAME_SAVE_PATH, { recursive: true })

        let i = 0;
        while(this.animateFrame(`${++i}.png`));
        spawnSync({
            cmd: ["ffmpeg", "-y", "-f", "concat", "-i", SequenceAnimator.FRAME_SEQUENCE_PATH, "-loop", "1", "out.webp"]
        })

        rmSync(SequenceAnimator.FRAME_SAVE_PATH, { force: true, recursive: true })
    }
}