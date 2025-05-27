# Hyper Space Wave

> Casual wave based shmup

## Monorepo Packages

- **apps/web**: Web client (Vite + React + PixiJS)
- **apps/native**: Native/mobile client (Expo + React Native)
- **packages/core**: Core game logic, rendering, hooks, ECS, and shared components
- **packages/assets**: Game assets (sprites, fonts, manifest, asset pipeline)
- **packages/leva**: Custom Leva controls and plugins for developer UI

## Up Next (TODO)

- [ ] Tuning Tables
  - Wave speed, Hazard speed and frequency
  - JSON data with expressions parsable via [math-expression-evaluator](https://github.com/bugwheels94/math-expression-evaluator) to compute values based on tokens like rank, and randomness from a seeded stream.
- [ ] Leva JSON table editor
  - Zod validation
  - Virtualized table
  - Live update
- [ ] Asset Server (packages/assets)
  - Read and write json data assets in dev
- [ ] HTTPS in dev
  - [auto-encrypt-localhost](https://codeberg.org/small-tech/auto-encrypt-localhost.git)
  - [vite-plugin-mkcert](https://github.com/liuweiGL/vite-plugin-mkcert/tree/main)
