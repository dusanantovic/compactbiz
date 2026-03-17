export function typed<T>(constr: new (...param: any) => T, prefix?: string) {
    return (fn: (obj: T) => any) => stringify(fn, prefix);
}

function stringify<T>(fn: (x: T) => any, prefix?: string): string {
    const body = fn.toString();
    const match = body.match(/\.([0-9a-zA-z.]+)/);
    const result = (match && match[1]) || "";
    return prefix ? `${prefix}.${result}` : result;
}

export const decamelize = (str: string, addLine = false) => str && str.replace(/([a-z](?=[A-Z]))/g, `$1${addLine ? "-" : " "}`);

export const getEnumText = (enumType: Record<string, any>, value: string) => {
    const entry = Object.entries(enumType).find((e: any[]) => e[1] === value);
    return (entry && entry[0]) || "";
};

export const getEnumEntries = <T extends Record<string, string>>(enumType: T, addEmpty = false, addLine = false) => {
    const empty = addEmpty ? [{ id: null, name: "" }] : [];
    let entries: { id: keyof T | null, name: keyof T | "" }[];

    const isNumberEnum = !isNaN(Object.keys(enumType)[0] as any);
    if (isNumberEnum) {
        entries = Object.keys(enumType)
            .filter((k) => !isNaN(k as any))
            .map(key => ({ id: parseInt(key), name: enumType[key].replace(/([a-z](?=[A-Z]))/g, `$1 `) })) as any;
    } else {
        entries = Object.entries(enumType)
            .map(e => ({ id: e[1], name: decamelize(e[0], addLine) }));
    }
    return [...empty, ...entries];
};