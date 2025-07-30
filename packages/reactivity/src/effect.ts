import { isArray } from "@vue/shared";
import { createDep, Dep } from "./dep";
import { ComputedRefImpl } from "./computed";
import { extend } from "@vue/shared";

type KeyToDepMap = Map<string | symbol, Dep>
export type EffectScheduler = (...args: any[]) => any
export let activeEffect: ReactiveEffect | undefined

const targetMap = new WeakMap<any, KeyToDepMap>()

export interface ReactiveEffectOptions {
    lazy?: boolean
    scheduler?: EffectScheduler
}

// 通过 activeEffect 标记当前运行的副作用
export class ReactiveEffect<T = any> {
    computed?: ComputedRefImpl<T>
    scheduler: EffectScheduler | null = null // 调度器接口
    // scheduler的作用
    // 实现批量更新（如 Vue 中的 queueJob）。
    // 控制副作用执行时机（如在 nextTick 执行，或者防抖、节流）。
    // 避免不必要的同步执行，提升性能。
    constructor(public fn: () => T,scheduler: EffectScheduler | null = null) {
        this.scheduler = scheduler
    }
    // 核心机制 1：响应式上下文管理
    run () {
        activeEffect = this // 建立当前执行的 effect 上下文
        return this.fn()  // 执行副作用函数
    }
    stop () {
    }
}

export function effect <T = any> (fn: () => T, options?: ReactiveEffectOptions) {
    const _effect = new ReactiveEffect(fn)
    if (options) {
        extend(_effect, options)
    }
    if (!options || !options.lazy){
        _effect.run()
    }
}
// 1.实现对象的 proxy代理 set/get reactive 响应式
// 2.当调用effect时，(ReactiveEffect) 会触发响应式数据get进行track依赖收集到Dep里
// 3.当调用trigger时，会触发set更新响应式数据会进行依赖触发，执行依赖收集的effect

//依赖收集
export function track (target: object, key: string | symbol) {
    if(!activeEffect){
        return;
    }
    let depsMap = targetMap.get(target);
   if(!depsMap){
    targetMap.set(target, (depsMap =  new Map() ))
   }
   let dep = depsMap.get(key)
   if(!dep){
    depsMap.set(key, (dep = createDep()) )
   }
   trackEffects(dep)
}

export function trackEffects(dep: Dep){
    dep.add(activeEffect!)
}

export function trigger (target: object, key: string | symbol, value: any) {
    const depsMaps = targetMap.get(target)
    if(!depsMaps){
        return;
    }
    const dep: Dep | undefined = depsMaps.get(key) as Dep;
    if(!dep){
        return
    }
    triggerEffects(dep)
}

// 依次触发 dep 中的effect
export function triggerEffects (dep: Dep) {
    const effects = isArray(dep) ? dep : [...dep]
    for (const effect of effects) {
        triggerEffect(effect)
    }
}

export function triggerEffect (effect: ReactiveEffect) {
    if(effect.scheduler) {
        effect.scheduler()
    } else {
        effect.run();
    }
}
