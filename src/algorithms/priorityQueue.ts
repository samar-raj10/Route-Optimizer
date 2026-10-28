export class PriorityQueue<T> {
  private heap: { item: T; priority: number; order: number }[] = []
  private counter = 0
  get size() { return this.heap.length }
  push(item: T, priority: number) {
    this.heap.push({ item, priority, order: this.counter++ })
    this.up(this.heap.length - 1)
  }
  pop(): T | undefined {
    if (!this.heap.length) return undefined
    const first = this.heap[0].item
    const last = this.heap.pop()!
    if (this.heap.length) { this.heap[0] = last; this.down(0) }
    return first
  }
  private less(a: number, b: number) {
    const x = this.heap[a], y = this.heap[b]
    return x.priority < y.priority || (x.priority === y.priority && x.order < y.order)
  }
  private up(i: number) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2)
      if (!this.less(i, p)) break
      ;[this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]]
      i = p
    }
  }
  private down(i: number) {
    while (true) {
      let best = i, left = 2 * i + 1, right = left + 1
      if (left < this.heap.length && this.less(left, best)) best = left
      if (right < this.heap.length && this.less(right, best)) best = right
      if (best === i) break
      ;[this.heap[i], this.heap[best]] = [this.heap[best], this.heap[i]]
      i = best
    }
  }
}
