import { createVNode, VNode } from './vnode'
import { ShapeFlags } from '../../shared/src/shapeFlags'

export function normalizeVNode(child) {
    if (typeof child === 'object') {
        return cloneIfMounted(child)
    } else {
        return createVNode(Text, null, String(child))
    }
}

export function cloneIfMounted(child) {
    return child
}

export function renderComponentRoot(instance) {
    const { vnode, render, data } = instance
    let result: any
    try {
        if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
            result = normalizeVNode(render.call(data))
        }
    } catch (error) {
        console.log(error)
    }
    return result
}
