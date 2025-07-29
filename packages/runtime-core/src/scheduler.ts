// 控制执行规则的任务队列
let isFlushPending = false

const pendingPreFlushCbs: Function[] = []

const resolvedPromise = Promise.resolve() as Promise<any>

let currentFlushPromise: Promise<void> | null = null

//这种设计是 Vue 的异步更新队列机制一致，通过合并相同事件循环内的多次更新，
// 避免不必要的重复计算和 DOM 操作。
// 先从这里看
export function queuePreFlushCb (cb: Function) {
    queueCb(cb, pendingPreFlushCbs)
}

function queueCb(cb: Function, pendingQueue: Function[]) {
    pendingQueue.push(cb)
    queueFlush()
}

// 依次执行队列函数
function queueFlush() {
     // 在微任务执行前（flushJobs 执行前），所有回调都会被收集到 pendingPreFlushCbs 队列中，
    // 保证本次事件循环的所有更新都被处理
    if(!isFlushPending){  // 防止重复刷新队列的锁机制,保证只创建一个微任务
        isFlushPending = true
        // 这里是微任务
        currentFlushPromise = resolvedPromise.then(flushJobs) //一次事件循环执行flushPreFlushCbs
    }
}

function flushJobs () {
    isFlushPending = false
    flushPreFlushCbs()
}

// 执行所有的 preFlushCbs
export function flushPreFlushCbs () {
    if (pendingPreFlushCbs.length) {
        let activePreFlushCbs = [...new Set(pendingPreFlushCbs)]
        pendingPreFlushCbs.length = 0
        for (let i = 0; i < activePreFlushCbs.length; i++){
            activePreFlushCbs[i]()
        }
    }
}
