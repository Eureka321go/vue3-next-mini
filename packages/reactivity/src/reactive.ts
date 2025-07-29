import { mutableHandlers } from './baseHandlers'
import { isObject } from '@vue/shared'

//存储已代理的对象
export const reactiveMap = new WeakMap<object, any>()

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive'
}
export function reactive(target: object) {
    return createReactiveObject(target, mutableHandlers, reactiveMap);
}

export function isReactive(value): boolean {
    return !!(value && value[ReactiveFlags.IS_REACTIVE])
}

function createReactiveObject(
    target: object,
    baseHandlers: ProxyHandler<any>,
    proxyMap: WeakMap<object, any>
) {
    const existingProxy = proxyMap.get(target)
    if (existingProxy) {
        return existingProxy
    }
    const proxy = new Proxy(target, baseHandlers)
    proxy[ReactiveFlags.IS_REACTIVE] = true
    proxyMap.set(target, proxy)
    return proxy
}


export const toReactive = <T extends unknown>(value: T): T => {
    // 要判断是否为对象
    return isObject(value) ? reactive(value as object) : value
}
