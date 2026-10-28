
import { SIZE, type CellKind, type Grid, type Point } from '../algorithms/types'
export type Scenario = { id: string; title: string; description: string; grid: Grid; start: Point; goal: Point }
const blank = (): Grid => Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 'road' as CellKind))
const line = (g: Grid, row: number, from: number, to: number, kind: CellKind) => {
  for (let c = from; c <= to; c++) g[row][c] = kind
}
export const createScenarios = (): Scenario[] => {
  const normal = blank()
  ;[[3,2,5],[7,8,11],[11,3,6]].forEach(([r,a,b]) => line(normal, r, a, b, 'highCost'))
  normal[5][5] = 'park'; normal[5][6] = 'park'; normal[10][10] = 'building'
  const accident = blank()
  line(accident, 6, 2, 11, 'blocked')
  accident[6][6] = 'road'
  accident[5][5] = 'blocked'; accident[7][8] = 'blocked'; accident[8][8] = 'highCost'
  const heavy = blank()
  line(heavy, 5, 2, 12, 'highCost')
  line(heavy, 8, 1, 10, 'highCost')
  ;[[4,5],[4,6],[9,4],[9,5],[9,6],[3,11],[10,12]].forEach(([r,c]) => heavy[r][c] = 'blocked')
  const unreachable = blank()
  line(unreachable, 7, 0, 14, 'blocked')
  unreachable[7][1] = 'blocked'; unreachable[7][13] = 'blocked'
  return [
    { id: 'normal', title: 'Normal City Traffic', description: 'A mostly open city with a few slower road segments.', grid: normal, start: { row: 1, col: 1 }, goal: { row: 12, col: 12 } },
    { id: 'accident', title: 'Road Accident', description: 'An accident blocks part of a direct route. Find a safe detour.', grid: accident, start: { row: 2, col: 2 }, goal: { row: 11, col: 11 } },
    { id: 'heavy', title: 'Heavy Traffic', description: 'Several roads have higher travel costs and a few are blocked.', grid: heavy, start: { row: 2, col: 1 }, goal: { row: 12, col: 13 } },
    { id: 'unreachable', title: 'Unreachable Destination', description: 'A complete barrier separates the start from the destination.', grid: unreachable, start: { row: 2, col: 7 }, goal: { row: 12, col: 7 } }
  ]
}
export const cloneGrid = (grid: Grid): Grid => grid.map(row => [...row])

