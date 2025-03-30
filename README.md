# Personal Website 2025

Source code for my 2025 personal website revamp.

## Notes

I was curious how far and artistic you can go with Javascript these days since the last personal webpage I had. I think back then having animated SVGs was the "new thing", hence I included that in my old (very basic) personal web page.

This time I decided to mess around with [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)/[Three.js](https://threejs.org/). This is after having messed around in basic [OpenGL](https://learnopengl.com/) in C++ a while ago -- Three.js is less annoying to use: mainly due to already having written all the classes I was essentially writing from scratch in OpenGL 😛 (honestly I'm surprised how similar their API design turned out to be to the stuff I was making up on the fly with my OpenGL experiment!).

I liked the idea of having a "pretty, custom, interactive" background with the whole page following the same "theme", and I thought making something "artsy" looking in 3D could be the next level of improvement to my page.

I started off with the idea of a [basalt columns](https://en.wikipedia.org/wiki/Columnar_jointing) "tunnel/ravine" scene (because I really like the geometry of these things) with water, and after looking at a bunch of inspiration pictures from search results like "`basalt columns fantasy art`" I came up with this. I used some "`Glasmorphism`" theme, mostly because I'd recently read about this trend in UI design.

Mind me, I'm a generalist SWE that lately mostly did distributed systems/backend. So excuse the rather hobbyist-looking design 😛


## Issues

- I wrote this while looking at a desktop computer browser. I have no idea what this looks like on mobile and I am too lazy to make it compatible. I think mobile interfaces generally have to be designed intentionally to make sense, rather than just trying to make existing UI "responsive"
- It seems that even on my rather overpriced "gaming" laptop, there's some issue where when trying to render my "glitching" animation on top of some more "complex" (in the sense of a lot of things changing simultaneously) WebGL animation in the background, such that even my laptop starts having hickups. I suppose it fits the "glitching" theme, but this isn't really intentional.
- It's not as optimised as it could be. More stuff (particularly time-bound position updates for e.g. the particles) could be moved into the shaders
- Honestly no idea if this will run on the average visitor's computer lol. For me it was hitting 230 FPS relatively consistently, but YMMV
- It's not automatically unit-tested whatsoever! There are certainly a few classes that could be tested, and I suppose you could write some headless browser automated test if you really wanted to be thorough

-----------
## Development

#### Prerequisites

- [nodejs](https://nodejs.org/en) with `npm` (initially built using `v20.16.0`)
- [TypeScript](https://www.typescriptlang.org/) knowledge. (Javascript knowledge will probably do, it's easy enough to infer)
- [GLSL](https://en.wikipedia.org/wiki/OpenGL_Shading_Language) knowledge for some of the shader edits

### Running Locally

Clone it:

```bash
git clone https://github.com/parawanderer/personalsite2025.git
cd personalsite2025
```

Run it:

```bash
npm i
npx vite
```

The website becomes available at `http://localhost:5173/`

### Building "production" build

```bash
npx vite build
```

## Acknowledgements

- Icons by [Google (Material 3)](https://fonts.google.com/icons)
- Some asset files were reused from Three.js (e.g. [`waternormals.jpg`](https://github.com/mrdoob/three.js/blob/62bb68551ea0f206976fb288a2174803bf361ae8/examples/textures/waternormals.jpg))
- The brand icons that I used on the "Contact Me"... "page"... were downloaded from the respective brands' design guidelines
- [Stone marble texture](https://www.sharetextures.com/textures/floor/storm_marble_1) used on the pillars by M. Tolga Arslan via [sharetextures.com](https://www.sharetextures.com)
- Various inspiration-sources used for _derivative_ implementations are documented in the code itself