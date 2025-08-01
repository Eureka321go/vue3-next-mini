import { isString } from '@vue/shared'

export function patchStyle(el:Element, prev: any, next: any) {
    const style = (el as HTMLElement).style;
    const isCssString = isString(next)
    if(next && !isCssString){
        for (const key in next){
            setStyle(style, key, next[key]);
        }
    }
    // 删除新样式中不存在的旧样式
    if(prev && !isString(prev)){
        for (const key in prev){
            if (next[key] == null){
                setStyle(style, key, '');
            }
        }
    }
}

function setStyle(style: CSSStyleDeclaration, name: string, value: string){
    if(isString(value)){
        style[name] = value
    }
}
