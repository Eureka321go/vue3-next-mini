import { isOn } from '@vue/shared'
import { patchClass } from './modules/class'
import { patchDomProp } from './modules/props'
import { patchStyle } from './modules/style'
import { patchAttr } from './modules/atttr'
import {patchEvent} from './modules/event'
export const patchProp = (el:Element, key, preValue, nextValue) => {
    if(key === 'class') {
        patchClass(el, nextValue)
    } else if (key === 'style') {
        patchStyle(el, preValue, nextValue)
    } else if (isOn(key)) {
        patchEvent(el, key, preValue, nextValue)
    } else if (shouldSetAsProp(el, key)){
        patchDomProp(el, key, nextValue)
    } else {
        patchAttr(el, key, preValue)
    }
}

function shouldSetAsProp(el:Element, key:string) {
    if (key === 'form') {
        return false
    }
    if (key === 'list' && el.tagName === 'INPUT') {
        return false
    }
    if (key === 'type' && el.tagName === 'TEXTAREA') {
        return false
    }
    return key in el
}
