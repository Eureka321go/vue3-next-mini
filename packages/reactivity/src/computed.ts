import { isFunction } from '@vue/shared'
import { Dep } from './dep'
import { ReactiveEffect } from './effect'
import { trackRefValue, triggerRefValue } from './ref'

//1.创建计算属性 allName = computed(() => "姓名：" + obj.name)， 内部创建 effect 实例new ReactiveEffect(getter, scheduler) 携带调度器

//2.页面 effect 执行 allName.value，
// （1）触发计算属性 get value()
// （2）收集页面 effect 到计算属性的 dep
// （3）执行计算属性的 getter 函数时 () => "姓名：" + obj.name  触发 obj.name 的 getter，
// （4）此时 activeEffect 是计算属性的 effect
// （5）将计算属性 effect 存入 obj.name 的 dep

//3.修改 obj.name // 查找 obj.name 的 dep
// （1）执行调度器而非直接运行,触发页面 effect 重新执行 ->  triggerRefValue(this) -> 执行页面的effect
// （2）allName.value 的get 重新计算值，返回新值更新 DOM


// 关键路径
//obj.name 修改 → 触发调度器 → 标记脏状态 → 触发页面 effect → 访问计算属性 → 重新计算 → 更新 DOM

export class ComputedRefImpl<T> {
    public dep?: Dep = undefined
    private _value!: T
    public readonly effect: ReactiveEffect<T>
    public readonly __v_isRef = true
    public _dirty = true
    constructor (getter) {
        // 内部创建 effect 实例
        this.effect = new ReactiveEffect(getter, () => {

            //** 这是一个scheduler，触发计算属性scheduler就是脏的情况 **//

            if(!this._dirty){ // 仅在非脏状态时触发更新
                this._dirty = true // 标记需要重新计算
                triggerRefValue(this)  // 触发页面 effect 的重新执行
            }
        })
    }
    get value () {
        // 收集页面 effect 到计算属性的 dep
        trackRefValue(this)
        // 访问计算属性 → 重新计算 → 更新 DOM
        if(this._dirty) {
            this._dirty = false
            // 计算属性内部触发响应式追踪： 当计算属性的 getter 执行时，会访问 obj.name：
            //  会触发 obj.name 的 track 流程：把计算属性的 effect 加入到 obj.name 的 dep 中
            this._value = this.effect.run()  // 关键步骤！
        }
        return this._value
    }
}
export function computed (getterOrOptions) {
    let getter
    const onlyGetter = isFunction(getterOrOptions)
    if(onlyGetter){
        getter = getterOrOptions
    }
    const cRef = new ComputedRefImpl(getter)
    return cRef
}
