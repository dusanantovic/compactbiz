import UrlPattern from "url-pattern";

export interface RouteList {
    path: string | RegExp;
    method: "POST" | "PUT" | "PATCH" | "GET" | "DELETE" | "OPTIONS";
}

export const matchRoutesPathAndMethod = (path: string, method: string, routeList: RouteList[]): boolean => {
    const regexList = routeList.filter(x => typeof x.path === "object");
    const stringList = routeList.filter(x => typeof x.path === "string");
    const routesRegexList = regexList.map(x => ({ pattern: new UrlPattern(x.path as RegExp), method: x.method }));
    const routesStringList = stringList.map(x => ({ pattern: new UrlPattern(x.path as string), method: x.method }));
    return [...routesRegexList, ...routesStringList].some(x => {
        const pass = x.pattern.match(path) && method === x.method;
        return pass;
    });
};