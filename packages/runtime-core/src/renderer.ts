import { isSameVNodeType, VNode } from './vnode'
import {Comment,Fragment,Text} from './vnode'
import { ShapeFlags } from '../../shared/src/shapeFlags'
import { EMPTY_OBJ, isString } from '@vue/shared'
import { h } from './h'
import { normalizeVNode } from './componentRenderUtils'
export interface RendererOptions {
    // 为指定的element 添加的props 打补丁
    patchProp: (el: Element, key: string, prevValue: any, nextValue: any) => void
    // 为指定的element 设置text
    setElementText: (node: Element, text: string) => void
    // 插入指定的el到parent中，anchor 表示插入的位置，即：锚点
    insert: (el: Node, parent: Node, anchor: Element) => void
    // 创建 element
    createElement: (type:string) => Element
    // 创建 text
    createText: (text: string) => Text
    // 移除 node
    remove: (node: Node | Text) => void
    // 设置text
    setText: (node: Text, text: string) => void
    // 创建 comment
    createComment: (text: string) => Comment
}
export function createRenderer(options: RendererOptions) {
    return baseCreateRenderer(options)
}

function baseCreateRenderer(options: RendererOptions): any {
    const {
        patchProp: hostPatchProps,
        setElementText: hostSetElementText,
        insert: hostInsert,
        createElement: hostCreateElement,
        remove: hostRemove,
        createText: hostCreateText,
        setText: hostSetText,
        createComment: hostCreateComment,
    } = options;
    const unmount = (vnode: VNode) => {
        hostRemove(vnode.el)
    }
    const processComment = (oldVNode: VNode, newVNode: VNode, container: Element, anchor: any) => {
        if (oldVNode == null) {
            // 挂载
            newVNode.el = hostCreateComment(newVNode.children)
            hostInsert(newVNode.el, container, anchor)
        } else {
            newVNode.el = oldVNode.el
        }
    }
    const processFragment = (oldVNode: VNode, newVNode: VNode, container: Element, anchor: any) => {
        if (oldVNode == null) {
            // 挂载
            mountChildren(newVNode.children, container, anchor)
        } else {
            patchChildren(oldVNode, newVNode, container, anchor)
        }
    }
    const processText = (oldVNode: VNode, newVNode: VNode, container: Element, anchor: any) => {
        if (oldVNode == null) {
            // 挂载
            newVNode.el = hostCreateText(newVNode.children)
            hostInsert(newVNode.el, container, anchor)
        } else {
            const el = (newVNode.el = oldVNode.el)
            if(newVNode.children !== oldVNode.children) {
                hostSetText(el, newVNode.children)
            }
        }
    }
    const processElement = (oldVNode: VNode, newVNode: VNode, container: Element, anchor = null) => {
        if (oldVNode === newVNode) {
            return
        }
        if(oldVNode == null) {
            // 挂载
            mountElement(newVNode, container, anchor)
        } else {
            //更新操作
            patchElement(oldVNode, newVNode, container, anchor)
        }
    }
    const patchElement = (oldVNode: VNode, newVNode: VNode, container: Element, anchor = null) => {
        const el = (newVNode.el = oldVNode.el)
        patchChildren(oldVNode, newVNode, el, null)

        const oldProps = oldVNode.props || EMPTY_OBJ
        const newProps = newVNode.props || EMPTY_OBJ
        patchProps(el, newVNode, oldProps, newProps)
    }
    const patchProps = (el: Element, vnode, oldProps, newProps) => {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const next = newProps[key]
                const prev = oldProps[key]
                if (prev !== next) {
                    // 这里更新props
                    hostPatchProps(el, key, prev, next)
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                // 旧属性中存在，新属性中不存在,把旧的属性删除
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        // 这里删除props ！！！！
                        hostPatchProps(el, key, oldProps[key], null)
                    }
                }
            }
        }
    }
    const patchChildren = (oldVNode: VNode, newVNode:VNode, container: Element, anchor) => {
        const c1 = oldVNode && oldVNode.children
        const c2 = newVNode && newVNode.children

        const prevShapeFlag = oldVNode ? oldVNode.shapeFlag : 0


        const {shapeFlag} = newVNode
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) { // 新节点是text

            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
               // TODO: 卸载旧子节点
            }
            if (c2 !== c1) {
                // 挂载新子节点的文本
                hostSetElementText(container, c2 as string)
            }
        } else {   // 新节点不是text
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    //TODO: diff
                } else {
                    // TODO: 卸载
                }
            } else {
                if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                    // 删除旧节点text
                    hostSetElementText(container, '')
                }
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                    // TODO: 单独新子节点的挂载
                }
            }
        }
    }
    const mountChildren = (children, container: Element, anchor) => {
        if(isString(children)) {
            children = children.split('')
        }
        for (let i = 0; i < children.length; i++) {
            const child = (children[i] = normalizeVNode(children[i]))
            patch(null, child, container, anchor)
        }
    }
    const mountElement = (vnode: VNode, container: Element, anchor) => {
        const {type, props, shapeFlag} = vnode
        // 创建element
        const el = (vnode.el = hostCreateElement(type))
        // 设置文本
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            hostSetElementText(el, vnode.children as string)
        }
        // 添加属性
        if (props) {
            for (const key in props) {
                hostPatchProps(el, key, null, props[key])
            }
        }
        // 插入到父元素中
        hostInsert(el, container, anchor)
    }
    const patch =(oldVNode: any, newVNode: any, container: Element, anchor = null,
    ) =>{
        if (oldVNode === newVNode) {
            return
        }
        // 判断新节点是否为旧的节点类型
        if(oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
            // 不是相同的节点类型，直接卸载旧节点，挂载新节点
            unmount(oldVNode)
            oldVNode = null
        }
        const {type, shapeFlag} = newVNode;
        switch (type) {
            case Text:
                processText(oldVNode, newVNode, container, anchor)
                break;
            case Comment:
                processComment(oldVNode, newVNode, container, anchor)
                break;
            case Fragment:
                processFragment(oldVNode, newVNode, container, anchor)
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                   processElement(oldVNode, newVNode, container, anchor)
                } else if (shapeFlag & ShapeFlags.COMPONENT) {

                }
        }
    }
    const  render = (vnode: VNode, container) => {
        if(vnode == null) {
            // TODO: 卸载
            if(container._vnode) {
                unmount(container._vnode)
            }
        } else {
          // 添加节点
          patch(container._vnode, vnode, container)
        }
        container._vnode = vnode
    }
    return {
        render
    }
}
