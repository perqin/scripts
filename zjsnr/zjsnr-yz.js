const data = [
  // chapter, index, a, b, c, d, hour, minute, second
  [1, 1,  0,  30,  0, 0, 0, 15, 0],
  [1, 2,  0,  30, 30, 0, 0, 30, 0],
  [1, 3, 30,  30, 30, 0, 0, 30, 0],
  [1, 4,  0, 100,  0, 0, 1,  0, 0],
  [2, 1, 150, 175, 20, 20, 2,  0, 0],
  [2, 2,   0,   0,  0, 75, 0, 45, 0],
  [2, 3,   0,   0, 50, 30, 1,  0, 0],
  [2, 4,  50, 100, 50, 50, 3,  0, 0],
].map(e => {
  const hours = e[6] + e[7] / 60 + e[8] / 3600
  return [e[0], e[1], e[2] / hours, e[3] / hours, e[4] / hours, e[5] / hours]
})

const maxChapter = 2

const open = data.filter(e => e[0] <= maxChapter)

function dfs(max, arr, n) {
  if (n == 4) {
    return [arr.slice()]
  } else {
    let ret = []
    for (let i = n == 0 ? 0 : arr[n - 1] + 1; i <= max; ++i) {
      arr[n] = i
      ret = ret.concat(dfs(max, arr, n + 1))
    }
    return ret
  }
}

function toTitle(i) {
  return `${open[i][0]}-${open[i][1]}`
}

dfs(open.length - 1, [], 0).map(e => {
  console.log(e)
  return e.concat(e.slice(0, 4).map(f => open[f]).reduce((pre, cur) => [-1, -1, pre[2] + cur[2], pre[3] + cur[3], pre[4] + cur[4], pre[5] + cur[5]]).slice(2, 6))
}).map(e => {
  const total = e[4] + e[5] + e[6] + e[7]
  return e.concat(total)
}).sort((a, b) => a[8] - b[8]).map(e => {
  return e.slice(0, 4).map(f => toTitle(f)).concat(e.slice(4, 9))
}).forEach(e => console.log(e))
