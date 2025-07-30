export function patchDomProp(el:Element, key: any, value: any){
    try {
        el[key] = value
    } catch (error) {
        console.log(error)
    }
}
