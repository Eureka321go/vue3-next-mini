import {LifecycleHooks} from './component'

export function injectHook(type: LifecycleHooks, hook: Function, target) {
    if(target){
        target[type] = hook
    }
}
export const createHook = (lifecycle: LifecycleHooks) => {
    return (hook: Function, target) => injectHook(lifecycle, hook, target)
}
export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT);
export const onMounted = createHook(LifecycleHooks.MOUNTED);
