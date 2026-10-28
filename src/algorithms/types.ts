
export type Point = { row: number; col: number }
export type CellKind = 'road' | 'blocked' | 'highCost' | 'building' | 'park'
export type Grid = CellKind[][]
export type AlgorithmName = 'A* Search' | "Dijkstra's Algorithm" | 'Greedy Best-First' | 'Breadth-First Search'
export type SearchResult = {
  algorithm: AlgorithmName
  path: Point[]
  pathCost: number | null
  steps: number | null
  nodesExplored: number
  executionTimeMs: number
  success: boolean
  optimality: string
  exploredNodes: Point[]
  message: string
}
export const SIZE = 15
export const keyOf = (p: Point) => `${p.row},${p.col}`
export const samePoint = (a: Point, b: Point) => a.row === b.row && a.col === b.col
export const inBounds = (p: Point, size = SIZE) => p.row >= 0 && p.col >= 0 && p.row < size && p.col < size
export const neighbors = (p: Point, size = SIZE): Point[] =>
  [{ row: p.row - 1, col: p.col }, { row: p.row, col: p.col + 1 }, { row: p.row + 1, col: p.col }, { row: p.row, col: p.col - 1 }].filter(n => inBounds(n, size))
export const heuristic = (a: Point, b: Point) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col)
export const enterCost = (grid: Grid, p: Point) => grid[p.row][p.col] === 'highCost' ? 4 : 1

