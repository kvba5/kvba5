import asciiArt from "../ascii.txt"

import Github from "./github"
import SequenceBuilder from "./terminal"

const mainColor = "white"
const secondaryColor = "red"

const USERNAME = process.env.USERNAME
const HOSTNAME = "readme"


if (!USERNAME) throw new Error("No username was provided into process.env.USERNAME!")
const gh = new Github(USERNAME, process.env.GITHUB_TOKEN)

const dateToAgeString = (d: Date) => {
    const diff = Date.now() - d.getTime()
    
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
    const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44))
    const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24))
    return `${years} years, ${months} months, ${days} days`
}



const STATS: Record<string, Record<string, (string | number) | (string | number)[]>> = {
    [`${USERNAME}@${HOSTNAME}`]: {
        name: "Kuba",
        uptime: dateToAgeString(new Date(2005, 4, 27)),
        os: ["Arch Linux", "Windows 10", "Android 13"]
    },
    contact: {
        "e-mail": "purr@meowpa.ws",
        discord: ".kb.",
        telegram: "kvba5",
        signal: "kvba.1000"
    },
    [`GitHub (${USERNAME})`]: {
        "Total Stars": await gh.getStarCount(),
        "Pull Requests": await gh.getPullRequests(),
        languages: ["Typescript", "Rust"]
    }
}

const getPseudoVersion = () => {
    const d = new Date()
    return `${d.getMonth() + 1}.${d.getDay()}`
}

const b = new SequenceBuilder({
    animator: {
        prompt: `%${secondaryColor}%-[%${mainColor}%${USERNAME}%${secondaryColor}%@%${mainColor}%${HOSTNAME}%${secondaryColor}%]> %${mainColor}%`
    }
})
    .wait(500)
    .appendText(`GitHubOS ${getPseudoVersion()} ${HOSTNAME}`)
    .wait(200)
    .pushDown()
    .wait(500)
    .appendText(`kvba (c) ${new Date().getFullYear()}`)
    .wait(200)
    .pushDown(2)
    .wait(500)
    .appendText(`${HOSTNAME} login: `)
    .wait(1000)
    .type(USERNAME)
    .pushDown()
    .appendText(`password for ${USERNAME}: `)
    .wait(300)
    .type("*".repeat(Math.floor(Math.random() * 4) + 8))
    .wait(100)
    .pushDown()
    .wait(1000)
    .clear()
    .prompt(true)
    .wait(500)
    .type("fastfetch")
    .prompt(false)
    .pushDown()
    .wait(500)

const asciiLines = asciiArt.split("\n")
const maxAsciiLineLength = Math.max(...asciiLines.map(l => l.length))

const statsString = Object.entries(STATS).reduce<string>((s, [name, props], i) => {
    s += `%${mainColor}%` + (i > 0 ? "\n\n" : "") + [
        name.replace(/^[a-z]/, s => s.toUpperCase()),
        "-".repeat(name.length + 2),
        ...Object.entries(props).map(([k, v]) => `%${mainColor}%${k.replace(/^[a-z]/, s => s.toUpperCase())}: %${secondaryColor}%${Array.isArray(v) ? `[${v.join(", ")}]` : v}`)
    ].join("\n")
    return s;
}, "")

const fastFetchResult = statsString
    .split("\n")
    .map((l, i) => `%${mainColor}%${(asciiLines[i] ?? "").padEnd(maxAsciiLineLength, " ")} ${l}`)
    .join("\n")

b.appendText(fastFetchResult + "\n")
    .prompt(true)
    .wait(1000)
    .setSpeed(0.5)
    .type("hi :3")
    .build()
