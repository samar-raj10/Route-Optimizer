import {
  enterCost,
  heuristic,
  keyOf,
  neighbors,
  samePoint,
  type AlgorithmName,
  type Grid,
  type Point,
  type SearchResult,
} from "./types";
import { PriorityQueue } from "./priorityQueue";

type Node = { point: Point; g: number; priority: number };
const reconstruct = (
  parents: Map<string, string>,
  start: Point,
  goal: Point,
): Point[] => {
  const result = [goal];
  let current = keyOf(goal);
  const startKey = keyOf(start);
  while (current !== startKey) {
    const parent = parents.get(current);
    if (!parent) return [];
    const [row, col] = parent.split(",").map(Number);
    result.push({ row, col });
    current = parent;
  }
  return result.reverse();
};
export const pathCost = (grid: Grid, path: Point[]) =>
  path.length <= 1
    ? 0
    : path.slice(1).reduce((sum, p) => sum + enterCost(grid, p), 0);

export function search(
  grid: Grid,
  start: Point,
  goal: Point,
  algorithm: AlgorithmName,
): SearchResult {
  const t0 = performance.now();
  const size = grid.length;
  const fail = (message: string, explored: Point[] = []): SearchResult => ({
    algorithm,
    path: [],
    pathCost: null,
    steps: null,
    nodesExplored: explored.length,
    executionTimeMs: Number((performance.now() - t0).toFixed(3)),
    success: false,
    optimality: "No path",
    exploredNodes: explored,
    message,
  });
  if (!size || grid.some((row) => row.length !== size))
    return fail("Invalid grid.");
  if (!grid[start.row]?.[start.col] || !grid[goal.row]?.[goal.col])
    return fail("Start or destination is outside the grid.");
  if (
    grid[start.row][start.col] === "blocked" ||
    grid[goal.row][goal.col] === "blocked"
  )
    return fail("Start and destination must be traversable.");
  if (samePoint(start, goal))
    return {
      algorithm,
      path: [start],
      pathCost: 0,
      steps: 0,
      nodesExplored: 1,
      executionTimeMs: Number((performance.now() - t0).toFixed(3)),
      success: true,
      optimality: "Optimal",
      exploredNodes: [start],
      message: "Start and destination are the same cell.",
    };

  const startKey = keyOf(start),
    goalKey = keyOf(goal);
  const parents = new Map<string, string>();
  const gScore = new Map<string, number>([[startKey, 0]]);
  const exploredSet = new Set<string>();
  const explored: Point[] = [];
  const queue = new PriorityQueue<Node>();
  const isAStar = algorithm === "A* Search";
  const isDijkstra = algorithm === "Dijkstra's Algorithm";
  const isGreedy = algorithm === "Greedy Best-First";
  const isBfs = algorithm === "Breadth-First Search";
  queue.push(
    { point: start, g: 0, priority: isAStar ? heuristic(start, goal) : 0 },
    isAStar ? heuristic(start, goal) : 0,
  );

  while (queue.size) {
    const node = queue.pop()!;
    const k = keyOf(node.point);
    const bestKnown = gScore.get(k);
    if (bestKnown !== node.g && !isGreedy && !isBfs) continue;
    if (exploredSet.has(k)) continue;
    exploredSet.add(k);
    explored.push(node.point);
    if (k === goalKey) {
      const path = reconstruct(parents, start, goal);
      const cost = pathCost(grid, path);
      const optimality =
        isAStar || isDijkstra
          ? "Optimal (minimum cost)"
          : isBfs
            ? "Shortest steps only; not guaranteed minimum cost"
            : "Not guaranteed optimal";
      return {
        algorithm,
        path,
        pathCost: cost,
        steps: Math.max(0, path.length - 1),
        nodesExplored: explored.length,
        executionTimeMs: Number((performance.now() - t0).toFixed(3)),
        success: true,
        optimality,
        exploredNodes: explored,
        message: "Route found successfully.",
      };
    }
    for (const next of neighbors(node.point, size)) {
      if (grid[next.row][next.col] === "blocked") continue;
      const nk = keyOf(next);
      if (exploredSet.has(nk)) continue;
      const tentative = node.g + enterCost(grid, next);
      if (isBfs) {
        if (gScore.has(nk)) continue;
        gScore.set(nk, tentative);
        parents.set(nk, k);
        queue.push(
          { point: next, g: tentative, priority: explored.length },
          explored.length,
        );
      } else if (isGreedy) {
        if (!gScore.has(nk)) {
          gScore.set(nk, tentative);
          parents.set(nk, k);
          queue.push(
            { point: next, g: tentative, priority: heuristic(next, goal) },
            heuristic(next, goal),
          );
        }
      } else if (tentative < (gScore.get(nk) ?? Infinity)) {
        gScore.set(nk, tentative);
        parents.set(nk, k);
        const priority = isAStar
          ? tentative + heuristic(next, goal)
          : tentative;
        queue.push({ point: next, g: tentative, priority }, priority);
      }
    }
  }
  return fail("No path available. Try removing some blocked roads.", explored);
}
