import { VNode } from '../../runtime-core/src/vnode'

const doc = document;
export const nodeOps = {
    insert: (child: Node, parent: Node, anchor: Element) => {
        parent.insertBefore(child, anchor || null);
    },
    createElement: (tag): Element => {
        const el = doc.createElement(tag);
        return el
    },
    setElementText: (node: Element, text: string) => {
        node.textContent = text
    },
    remove: (child: Node) => {
        const parent= child.parentNode
        if (parent) {
            parent.removeChild(child)
        }
    },
    createText: (text: string): Text => {
        return doc.createTextNode(text)
    },
    setText: (node: Text, text: string) => {
        node.nodeValue = text
    },
    createComment: (text: string): Comment => {
        return doc.createComment(text)
    }
}
