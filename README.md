# Emergency Route Optimizer

A student-level AISC project that demonstrates heuristic search through a simulated city grid. It implements A*, Dijkstra's algorithm, Greedy Best-First Search, and Breadth-First Search.

## Features

- Interactive 15 × 15 grid with start, destination, blocked cells, and high-cost roads.
- A* route search using Manhattan distance.
- Optional search animation.
- Four predefined scenarios, including an unreachable destination.
- Comparison table and charts generated from actual algorithm runs.
- Educational explanation of the algorithms, assumptions, and limitations.
- Automated tests for important pathfinding cases.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Build and test

```bash
npm run test
npm run build
npm run preview
```

## Cost model

- Normal road: cost 1 to enter.
- High-cost road: cost 4 to enter.
- Blocked road: cannot be entered.
- Movement: up, down, left, or right only.
- Start cell is not charged as an entered cell.

A* uses `f(n) = g(n) + h(n)` with Manhattan distance. With four-directional movement and minimum step cost 1, the heuristic is admissible and consistent. Dijkstra is the minimum-cost reference. Greedy Best-First is not guaranteed to be optimal. BFS minimizes number of steps, not weighted cost.

## Project limitations

This is a simulation, not a real ambulance navigation system. The grid does not represent real streets, road restrictions, live traffic, or emergency dispatch. Browser timing varies by device and run. Comparison timing should be interpreted as an experiment, not a universal performance claim.
