import { validateSync } from "class-validator";
import { randomFillSync } from "crypto";
import { BadRequestError } from "routing-controllers";

export type Timeout = ReturnType<typeof setTimeout>;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RemoveFromType<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export function randomHash(nChar = 32): string {
    const nBytes = Math.ceil(nChar = (+nChar || 8) / 2);
    let u = new Uint8Array(nBytes);
    u = randomFillSync(u);
    const zpad = (s: any): string => "00".slice(s.length) + s;
    const a = Array.prototype.map.call(u, x => zpad(x.toString(16)));
    let str = a.join("").toUpperCase();
    if (nChar % 2) {
        str = str.slice(1);
    }
    return str;
}

export function randomPin(): string {
    const pin = (Math.floor(Math.random() * 99999) + 10000).toString(); // Between 10000 - 99999
    const simplePins = ["00000", "11111", "22222", "33333", "44444", "55555", "66666", "77777", "88888", "99999", "12345", "54321"];
    if (simplePins.includes(pin)) {
        return randomPin();
    }
    return pin;
}

export function delay(ms: number): Promise<number> {
   return new Promise(resolve => setTimeout(() => resolve(ms), ms));
}

export function extract(obj: Record<string, any>, f: string): unknown {
   let value;
   if (obj[f] !== undefined) {
       value = obj[f];
       delete obj[f];
   }
   return value;
}

export function normalize(text?: string): string {
   return text ? text.replace(/[^\s\p{Letter}0-9&\.\/]+/igu, " ").replace(/[\s]{2,}/g, "").trim() : "";
}

export function normalizeCompare(text1?: string, text2?: string): boolean {
   return normalize(text1).toLowerCase() === normalize(text2).toLowerCase();
}

export function flatMap<T, U>(array: T[], fn: (value: T, index: number, array: T[]) => U[]): U[] {
   return ([] as U[]).concat(...array.map(fn));
}

export function distinct<T, U>(array: T[], fn: (value: T, index: number, array: T[]) => U): T[] {
   const mapped = array.map(fn);
   return array.filter((element, index) => mapped.indexOf(fn(element, index, array)) === index);
}

export function range(from: number, to: number): number[] {
   return [...Array(to - from).keys()].map(i => i + from);
}

export function count<T>(array: T[], fn: (value: T, index: number, array: T[]) => boolean): number {
   return array.reduce((x, y, i, arr) => fn(y, i, arr) ? x + 1 : x , 0);
}

export function groupBy<T, R>(array: T[], fn: (x: T) => R): Map<R, T[]> {
   return array.reduce((cumulus: Map<R, T[]>, next: T) => {
       const key = fn(next);
       if (cumulus.has(key)) {
           const group = cumulus.get(key) as T[];
           group.push(next);
       } else {
           cumulus.set(key, [next]);
       }
       return cumulus;
   }, new Map<R, T[]>());
}

export interface OrderBy<T> {
   by: (value: T) => number;
   desc?: boolean
}

export function order<T>(array: T[], ...ords: OrderBy<T>[]): T[] {
   return Array.from(array)
       .sort((x, y) => ords.reduce((cumulus, ord) => cumulus === 0 ? (!ord.desc ? ord.by(x) - ord.by(y) : ord.by(y) - ord.by(x)) : cumulus, 0)
   );
}

export function diff<T>(a: T[], b: T[], fn = (x: T, y: T): boolean => x === y): T[] {
   return a.filter((i) => !b.some(j => fn(i, j)));
}

export function intersect<T>(a: T[], b: T[], fn = (x: T, y: T): boolean => x === y): T[] {
   return a.filter((i) => b.some(j => fn(i, j)));
}

export function sum<T>(a: T[], fn: (element: T) => number): number {
   return a.reduce((x, y) => x + fn(y), 0);
}

export function remove<T>(a: T[], fn: (element: T, i?: number) => boolean): T[] {
   const removed: T[] = [];
   let length = a.length;
   for (let i = 0; i < length; i++) {
       if (fn(a[i], i)) {
           removed.push(...a.splice(i, 1));
           i--;
           length--;
       }
   }
   return removed;
}

export function random(min: number, max: number): number {
   return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomElement<T>(array: T[]): T {
   return array[random(0, array.length - 1)];
}

export function min<T>(arr: T[], fn: (x: T) => number): T | null {
    if (arr.length === 0) return null;
    let min = arr[0];
    for (const el of arr) {
        if (fn(el) < fn(min)) min = el;
    }
    return min;
}

export function max<T>(arr: T[], fn: (x: T) => number): T | null {
   if (arr.length === 0) return null;
    let max = arr[0];
    for (const el of arr) {
        if (fn(el) > fn(max)) max = el;
    }
    return max;
}

export function traverse(obj: object, fn: (value: any, key: string, parent: object) => any): void {
    const o = obj as any;
    Object.entries(obj).forEach(([key, value]) => {
        if (value instanceof Array) {
            for (let i = 0; i < value.length; i++) {
                if (typeof value[i] === "object" && value[i] !== null) {
                    traverse(value[i], fn);
                } else {
                    value[i] = fn(value[i], key, obj);
                }
            }
        } else if (typeof value === "object" && value !== null) {
            traverse(value, fn);
        } else {
            o[key] = fn(value, key, obj);
        }
    });
}

export function round(value: number, decimalPlaces = 2): number {
   return Math.round(value * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
}

export function validEmail(email: string): boolean{
   const filter = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
   return String(email).search(filter) !== -1;
}

export function validPhone(phone: string): boolean {
   // Regex = /^[\+][(]?[0-9]{3}[)]?[0-9]{3}[0-9]{4,6}$/ Example = +381641111111
   const filter = /^[\+][0-9]{10,12}$/;
   return String(phone).search(filter) !== -1;
}

export function hasNumber(myString: string): boolean {
   return /\d/.test(myString);
}

export function firstCharUpperCase(value: string): string {
   return value.charAt(0).toUpperCase() + value.slice(1);
}

export function promiseAllSettled<T>(promises: Array<Promise<T>>): Promise<Array<Error | T>> {
   return Promise.all(promises.map(p => {
       return p.catch((e: any) => {
           if (e instanceof Error) {
               return e;
           } else {
               return new Error(JSON.stringify(e));
           }
       });
   }));
}

export async function promiseAllSuccessful<T>(promises: Array<Promise<T>>): Promise<Array<T>> {
   const arr = await promiseAllSettled(promises);
   return arr.filter(r => !(r instanceof Error)) as T[];
}

export function assert(condition: any, messages: string[], error = BadRequestError): asserts condition {
   if (!condition) {
       throwError(messages, error);
   }
}

/** 
 * @throws {Error}
 */
export function throwError(messages: string[], error = BadRequestError): never {
    console.log(messages);
    throw new error(getErrorMessages(...messages));
}

export function getErrorMessages(...messages: string[]): string {
    return JSON.stringify(messages);
}

export function queryToObject(query: string): any {
   return JSON.parse(`{"` + query.replace(/&/g, `","`).replace(/=/g, `":"`) + `"}`, function (key, value) { return key === "" ? value : decodeURIComponent(value); });
}

export function bigPush<T>(a1: T[], a2: T[]): void {
   const cn = a1.length;
   const xn = a2.length;
   for (let i = cn, j = 0; i < cn + xn; i++, j++) {
       a1[i] = a2[j];
   }
}

export function diffInYears(dt1: Date, dt2: Date): number {
   let diff = (dt1.getTime() - dt2.getTime()) / 1000;
   diff /= (60 * 60 * 24);
   return Math.abs(Math.round(diff / 365.25));
}

/**
* @description Compare if valueX is the same as valueY. In array case valueX and valueY needs to be sorted
*/
export function compare<T>(valueX: T, valueY: T): boolean {
   if (Array.isArray(valueX) && Array.isArray(valueY)) {
       for (let i = 0; i < valueX.length; i++) {
           if (!compare(valueX[i], valueY[i])) {
               return false;
           }
       }
       return true;
   } else if (valueX && valueY && typeof valueX === "object" && typeof valueY === "object") {
       const keys = Object.keys(valueX).map(key => key);
       for (let i = 0; i < keys.length; i++) {
           // @ts-ignore
           if (!compare(valueX[keys[i]], valueY[keys[i]])) {
               return false;
           }
       }
       return true;
   }
   return valueX === valueY;
}

export function trimAndLowerCase(value?: string | null): string | null {
    if (!value || !value.trim()) {
        return null;
    }
    return value.trim().toLowerCase();
}

export function namespace(root: Record<string, any>, path: string): string {
   const parts = path.split(".");
   return getResultNameSpace(root, parts);
}

function getResultNameSpace(root: Record<string, any>, parts: string[]): any {
   const part = parts[0];
   parts.splice(0, 1);
   if (root[part] && parts[0]) {
       getResultNameSpace(root[part], parts);
   }
   return root[part];
}

export function validator<T extends object>(data: T, skipFields: Array<keyof T> = []): void {
    const errors = validateSync(data);
    if (errors.length > 0) {
        const errorsAfterFilter = flatMap(errors.map(error => {
            if (!skipFields.includes(error.property as keyof T) && error.constraints) {
                return Object.keys(error.constraints).map(key => error.constraints![key]);
            }
            return [""];
        }), (x: string[]) => x)
        .filter(x => x);
        if (errorsAfterFilter.length > 0) {
            throw new BadRequestError(JSON.stringify(errorsAfterFilter));
        }
    }
}