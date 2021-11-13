// 根据不同的参数实现不同的功能
import { isObject } from "@vue/shared"
import { mutableHandlers, readonlyHandlers, shallowReactiveHandlers, shallowReadonlyHandlers } from "./baseHandlers"

// 1.proxy 是一个es6的api，兼容性差，我们先来看一下这个 api 是怎么使用的
// http://js.jirengu.com/juyim/3/edit?js,console,output

// 给每个对象增加一个缓存区，防止对象被重复代理
// 之所以使用 WeakMap,它有一个能力叫弱“引用”
// map"强引用“,它的key是可以用对象的,所以不会进入垃圾回收机制，会导致内存泄露
// weakMap中的key只能是对象，如果引用的key 被置为 null weakmap 会自行自动回收
// 用了 webmap 我们就不需要去手动的管理这些内存问题
const reactiveMap = new WeakMap();
const readonlyMap = new WeakMap();
const shallowReadonlyMap = new WeakMap();
const shallowReactiveMap = new WeakMap();

// 函数科里化：这四个 api 都是使用 proxy 包装一下，区别只是是否仅读，是否浅层代理
export function reactive(target:object){ // mutableHandlers
    return createReactiveObject(target,mutableHandlers,reactiveMap);
}
export function shallowReactive(target:object){ // shallowReactiveHandlers
    return createReactiveObject(target,shallowReactiveHandlers,shallowReactiveMap)
}
export function readonly(target:object){ // readonlyHandlers
    return createReactiveObject(target,readonlyHandlers,readonlyMap)
}
export function shallowReadonly(target:object){ // shallowReadonlyHandlers
    return createReactiveObject(target,shallowReadonlyHandlers,shallowReadonlyMap)
}


/**
 * @description 创建响应式对象 以上四个方法最终用的都是这一个方法，这个方法会根据参数的不同 来进行不同的处理,我们用这个方法来抹平差异
 * @param {Object} target 需要被代理的目标对象
 * @param {Function} baseHandlers 针对每种方式对应的不同处理函数
 * @param proxyMap
 */
export function createReactiveObject(target,baseHandlers,proxyMap) {
    // 和 vue2 一样要看一下目标是不是对象,不是对象直接返回，无需代理
    if(!isObject(target)){
        return target
    }
    // 创建代理对象返回， let obj = {} reactive(obj)   readonly(obj) 做缓存 不要重复代理
    // const proxyMap  = isReadonly ? readonlyMap : reactiveMap
    const existsProxy = proxyMap.get(target);
    // 如果已经代理过了，直接返回
    if(existsProxy){
        return existsProxy
    }
    // 创建代理对象
    const proxy = new Proxy(target,baseHandlers);
    proxyMap.set(target,proxy); // 缓存起来，避免重复代理 reactive(reactive({}))
    return proxy
}
