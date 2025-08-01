import { createVNode, isVNode, VNode } from './vnode'
import { isObject } from '@vue/shared'

export function h (type: any, propsOrChildren?: any, children?: any):VNode {
    const l = arguments.length;
    if(l === 2){
        if(isObject(propsOrChildren) && !Array.isArray(propsOrChildren)){
            if(isVNode(propsOrChildren)){
                return createVNode(type, null, [propsOrChildren])
            }
            return createVNode(type, propsOrChildren, [])
        } else {
            return createVNode(type, null, propsOrChildren)
        }
    } else {
        if (l > 3) {
            children = Array.prototype.slice.call(arguments, 2)
        } else if (l === 3 && isVNode(children)) {
            children = [children]
        }
        return createVNode(type, propsOrChildren, children)
    }
}
