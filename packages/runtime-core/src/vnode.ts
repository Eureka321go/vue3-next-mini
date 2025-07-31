import { isArray, isFunction, isObject, isString } from '@vue/shared'
import { ShapeFlags } from '../../shared/src/shapeFlags'
import { normalizeClass } from '../../shared/src/normalizeProp'

export type VNode = {
    __V_isVNode: true,
    type: any,
    props: any,
    children: any,
    el: any,
    key: any,
    component: any,
    shapeFlag: number, //用 & 或 | 进行判断/组合
    // 用位掩码标记 VNode 和子节点类型。
    // 通过 |（合并）、&（判断）快速确定节点处理逻辑。
    // 让 patch/渲染过程可以快速分支，提高运行时性能。
}

export const Text = Symbol('text')
export const Fragment = Symbol('Fragment')
export const Comment = Symbol('Comment')

export function isSameVNodeType (oldVNode: VNode, newVNode: VNode) {
    return oldVNode.type === newVNode.type && oldVNode.key === newVNode.key
}
export function isVNode (value: any) {
    return (value ? value.__V_isVNode : false)
}
export function createVNode(type: any, props: any, children: any):VNode {
    const shapeFlag = isString(type)
        ? ShapeFlags.ELEMENT // 是字符串 表示是元素
        : isObject(type)
        ? ShapeFlags.STATEFUL_COMPONENT // 是object 表示有状态组件
        : 0

    if (props) {
        let {class: klass, style} = props
        if(klass && !isString(klass)) {
            props.class = normalizeClass(klass)
        }
    }

    return createBaseVNode(type, props, children, shapeFlag)
}

function createBaseVNode(type, props, children, shapeFlag) {
    const VNode = {
        __V_isVNode: true,
        type,
        props,
        shapeFlag,
    } as VNode

    //对children内容进行解析
    normalizeChildren(VNode, children)

    return VNode
}

function normalizeChildren(vnode: VNode, children: unknown) {
    let type = 0
    const {shapeFlag} = vnode
    if(children == null) {
        children = null
    } else if(isArray(children)) {

        type = ShapeFlags.ARRAY_CHILDREN

    } else if(typeof children === 'object') {

    } else if(isFunction(children)) {

    } else {
        children = String(children)
        type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.children = children
    // 很关键代表vNode的children类型
    vnode.shapeFlag |= type
}
