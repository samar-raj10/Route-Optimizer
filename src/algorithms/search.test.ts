import { describe, expect, it } from 'vitest'
import { search } from './search'
import { SIZE, type Grid, type Point } from './types'
const openGrid = (): Grid => Array.from({length: SIZE}, () => Array.from({length: SIZE}, () => 'road' as const))
const start: Point = {row: 0, col: 0}
const goal: Point = {row: 4, col: 4}
describe('pathfinding algorithms', () => {
  it('A* and Dijkstra return the same minimum cost on an open grid', () => {
    const grid = openGrid()
    const a = search(grid, start, goal, 'A* Search')
    const d = search(grid, start, goal, "Dijkstra's Algorithm")
    expect(a.success).toBe(true)
    expect(a.pathCost).toBe(d.pathCost)
  })
  it('does not cross a complete blocked barrier', () => {
    const grid = openGrid()
    grid[2].fill('blocked')
    const result = search(grid, start, goal, 'A* Search')
    expect(result.success).toBe(false)
    expect(result.path).toHaveLength(0)
  })
  it('handles start equal to destination', () => {
    const result = search(openGrid(), start, start, 'A* Search')
    expect(result.success).toBe(true)
    expect(result.pathCost).toBe(0)
    expect(result.steps).toBe(0)
  })
  it('prefers a cheaper route over high-cost cells', () => {
    const grid = openGrid()
    for (let c = 0; c < 5; c++) grid[0][c] = 'highCost'
    const result = search(grid, start, goal, 'A* Search')
    expect(result.success).toBe(true)
    expect(result.pathCost).toBeLessThan(20)
  })
})
