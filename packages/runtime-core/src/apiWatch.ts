import { EMPTY_OBJ, hasChanged } from "@vue/shared"
import {isReactive} from "@vue/reactivity"
import { queuePreFlushCb } from "./scheduler"
import {ReactiveEffect} from "@vue/reactivity"
import {isObject} from "@vue/shared"
export interface WatchOption<immediate = boolean> {
    immediate?: immediate
    deep?: boolean
}
export function watch(source, cb: Function, options?: WatchOption){
    return doWatch(source, cb, options)
}

function doWatch(source, cb: Function, {immediate, deep}: WatchOption = EMPTY_OBJ){
    let getter: () => any
    if(isReactive(source)){
        getter = () => source
        deep = true
    } else {
        getter = () => {}
    }
    if (cb && deep) {
        // 递归访问所有属性
        const baseGetter = getter
        // 这里是个getter函数
        getter = () => traverse(baseGetter())
    }

    let oldValue = {}

    const job = () => {
        if(cb){
            const newValue = effect.run()
            if(deep || hasChanged(newValue, oldValue)){
                cb(newValue, oldValue)
                oldValue = newValue
            }
        }
    }

    let scheduler = () => queuePreFlushCb(job)

    const effect = new ReactiveEffect(getter, scheduler)

    if(cb){
        if(immediate){
            job()
        } else {
            oldValue = effect.run() // 这里触发依赖收集
            //执行 getter 时访问响应式属性，触发 track 流程
        }
    }
    return () => {
        effect.stop()
    }
}
// 被监听数据 (source) 的 dep → 包含 watch 的 effect
// ↓
// 当 source 变化 → 触发 effect.scheduler() → 加入微任务队列 → 执行回调
export function traverse (value: unknown) {
    if (!isObject(value)) {
      return value
    }
    for (const key in value as object) {
       traverse((value as object)[key])
    }
    return value
}
