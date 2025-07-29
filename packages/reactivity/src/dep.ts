 import { ReactiveEffect } from "./effect";

 export type Dep = Set<ReactiveEffect>

 export const createDep = (effects?: ReactiveEffect[]): Dep => {
    return new Set<ReactiveEffect>(effects) as Dep
 }

  