export const isArray = (obj: any): boolean => {
  return Object.prototype.toString.call(obj) === '[object Array]';
}; 
export const isObject = (obj: any): boolean => {
    return obj !== null && typeof obj === 'object'
}
export const hasChanged = (value: any, oldValue: any): boolean => {
    return !Object.is(value, oldValue)
}
export const isFunction = (val: unknown): val is Function => typeof val === 'function'

export const extend = Object.assign

export const EMPTY_OBJ: {readonly [key: string]: any} = {}