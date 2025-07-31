import { isFunction, isObject } from '@vue/shared'
import { reactive } from '@vue/reactivity'
import { onBeforeMount, onMounted } from './apiLifecycle'

let uuid = 0;

export const enum LifecycleHooks {
    BEFORE_CREATE = 'bc',
    CREATED = 'c',
    BEFORE_MOUNT = 'bm',
    MOUNTED = 'm',
    BEFORE_UPDATE = 'bu',
    UPDATED = 'u',
    BEFORE_UNMOUNT = 'buu',
    UNMOUNTED = 'uu',
}

export function createComponentInstance(vnode) {
    const type = vnode.type;
    const instance = {
        uuid: uuid++, // 组件实例的唯一标识
        vnode, // 组件的vnode
        type, // 组件的类型
        subTree: null,// 组件的子树
        effect: null, // 组件的effect
        update: null, // 组件的更新函数
        render: null, // 组件的渲染函数
        data: null, // 组件的响应式data
        isMounted: false,
        bc: null,
        c: null,
        bm: null,
        m: null,
    }
    return instance
}

function setupStatefulComponent(instance) {
    const Component= instance.type
    const {setup} = Component
    if (setup) {
        const setupResult = setup()
        handleSetupResult(instance, setupResult)
    } else {
        finishComponentSetup(instance)
    }

}

export function handleSetupResult(instance, setupResult) {
    if (isFunction(setupResult)) {
        instance.render = setupResult
    }
    finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
    if(!instance.render) {
        instance.render = instance.type.render
    }
    applyOptions(instance)
}
export function setupComponent(instance) {
    setupStatefulComponent(instance)
}

function applyOptions(instance) {
    const {data: dataOptions, beforeCreate, created, beforeMount, mounted} = instance.type

    if(dataOptions){
        const data = dataOptions()
        if (beforeCreate) {
            callHook(beforeCreate, data)
        }
        if(isObject(data)){
            instance.data = reactive(data);
        }
    }

    if(created){
        callHook(created, instance.data)
    }
    // 了解下这个函数的设计
    // 注册生命周期函数，就是把对应生命周期函数挂载instance实例上
    function registerLifecycleHook (register: Function, hook: Function) {
        register(hook?.bind(instance.data), instance)
    }
    // 注册beforeMount
    registerLifecycleHook(onBeforeMount,  beforeMount)
    // 注册mounted
    registerLifecycleHook(onMounted,  mounted)
}
function callHook(hook: Function, proxy) {
    hook.bind(proxy)()
}
