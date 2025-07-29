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
        // 这里递归调用触发getter进行依赖收集
        const baseGetter = getter
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
            oldValue = effect.run()
        }
    }
    return () => {
        effect.stop()
    }
}

export function traverse (value: unknown) {
    if (!isObject(value)) {
      return value
    }
    for (const key in value as object) {
       traverse((value as object)[key])
    }
    return value
}