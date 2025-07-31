export const patchEvent = (
    el: Element & {_vei?: Object},
    rawName: string,
    prevValue,
    nextValue) => {
    // 获取或初始化事件 invokers 的缓存，_vei 是一个对象，用于缓存事件 invoker
    const invokers = el._vei || (el._vei = {})
    const existingInvoker = invokers[rawName]
    // 当事件更新时，直接修改 invoker.value 而不需要重新绑定事件
    if (nextValue && existingInvoker){
        existingInvoker.value = nextValue // 仅更新值，不重新绑定
    } else {
        const name = parseName(rawName)
        if (nextValue){
            // 缓存事件 invoker
            const invoker = (invokers[rawName] = createInvoker(nextValue))
            el.addEventListener(name, invoker)
        } else if (existingInvoker) {
            el.removeEventListener(name, existingInvoker.value)
            // 移除事件时清理缓存
            invokers[rawName] = undefined
        }
    }
}

function parseName(rawName: string): string {
    return rawName.slice(2).toLowerCase()
}

function createInvoker(initalValue) {
    const invoker = (e: Event) => {
        invoker.value && invoker.value()
    }
    invoker.value = initalValue
    return invoker
}
