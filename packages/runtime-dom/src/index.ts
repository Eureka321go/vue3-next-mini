import { createRenderer } from '../../runtime-core/src/renderer'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'
import { extend } from '@vue/shared'

const rendererOptions = extend({patchProp}, nodeOps)
let renderer
function ensureRenderer() {
    return renderer || (renderer = createRenderer(rendererOptions))
}
export const render = (...args) => {
    return ensureRenderer().render(...args)
}
