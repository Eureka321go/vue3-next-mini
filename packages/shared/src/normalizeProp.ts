import { isArray, isObject, isString } from './index'

export function normalizeClass(value: unknown): String {
    let res = ''
    if(isString(value)) {
        res = value
    } else if (isArray(value)) {
       for (let i = 0; i < (value as []).length; i++) {
           let normalize = normalizeClass((value as [])[i]);
           if(normalize) {
               res += normalize + " "
           }
       }
    } else if (isObject(value)) {
        for (const key in value as object) {
            if((value as object)[key]){
                res += key + " "
            }
        }
    }
    return res.trim()
}
