# meowabyte (terminal.js)
My readme generator script (originally named terminal.js) which generates nice little terminal animation with fastfetch-like output that has all stats about me.  
> [!NOTE]
> If you want to use the `ascii.txt` example README, please for the love of god DO NOT USE BRAILE ASCII ARTS. Since fonts are weird about them.  
> <sup>(took me good hour to figure that out)</sup>

Originally I used [github-readme-terminal by x0rzavi](https://github.com/x0rzavi/github-readme-terminal) which is written in Python but since I'm more knowledgable in Node.JS I decided to write my own package for similar use.  

The code automatically reads `theme.toml` file and `*.ttf` file in working directory for theme colors and font to be used in animation. `ascii.txt` is my own file with ascii art used in final fastfetch output. You can remove it if you want to change the animation.  

You're allowed to use and/or modify this repo for your profile as long as you will follow the [license](/LICENSE). (please)  

(Also please don't use `Github` class for other stuff then this project. It's actually bad and has no caching which might be bad long term)

## Requirements
- [Bun Runtime](https://bun.sh/)@^1.2.13
- <details>
  <summary><a href="https://ffmpeg.org">FFmpeg</a></summary>  

  You should be able to reach frame generating stage without errors if you don't have ffmpeg installed. You can always use your own solution instead.
  </details>

## How to run?
- ```sh
  # Install dependencies
  bun install --frozen-lockfile
  ```
- ```sh
  # Run script
  bun start # or bun .
  ```

Please set the `USERNAME` enviornment variable so code knows who to check!  
It is recommended to set `GITHUB_TOKEN` enviornment variable for local testing to not accidentally hit rate limit!
