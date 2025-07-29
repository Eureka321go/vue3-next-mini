import { createDep, Dep } from './dep';
import { activeEffect, trackEffects, triggerEffects } from './effect';
import { toReactive } from './reactive';
import { hasChanged } from '@vue/shared';
export interface Ref<T = any> {
    value: T,
    __v_isRef: true,
    dep?: Dep,
}
export function ref (value?: unknown) {
    return createRef(value, false)
}

function createRef(rewValue: unknown, shallow: boolean) {
    if(isRef(rewValue)) {
        return rewValue
    }
    return new RefImpl(rewValue, shallow)
}

export function isRef(r: any): r is Ref {
    return !!(r && r.__v_isRef === true)
}
// 这里的reactive一样，在effect触发get时，会调用trackRefValue进行依赖收集effect的activeEffect
// 这里的triggerRefValue会调用triggerEffects进行依赖触发
class RefImpl<T> {

    private _value: T

    private _rawValue: T

    public readonly __v_isRef = true
    
    public dep?: Dep = undefined

    constructor(value: T, public readonly __v_isShallow: boolean) {
        this._rawValue = value
        this._value = __v_isShallow ? value : toReactive(value)
    }

    get value () {
        trackRefValue(this)
        return this._value
    }

    set value (newValue: T) {
        if(hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue
            this._value = toReactive(newValue)
            triggerRefValue(this)
        }
    }
   
}

export function trackRefValue(ref: Ref) {
    if(activeEffect) {
        trackEffects(ref.dep || (ref.dep = createDep()))
    }
}

export function triggerRefValue(ref: Ref) {
    if(ref.dep) {
        triggerEffects(ref.dep)
    }
}