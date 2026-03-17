import { stringify } from "query-string";
import { fetchUtils, DataProvider } from "ra-core";
import { http } from "./http";
import { config } from "./config";

const overrideIdWithIdentity = (data: any) => {
    if (Array.isArray(data)) {
        data.forEach(x => {
            if (x.id && x._id) {
                x.id = x._id;
            }
        });
    } else if (data !== null && typeof data === "object") {
        if (data.id && data._id) {
            data.id = data._id;
        }
    }
    return data;
};

export const buildHttpUrl = (path: string, queryParams?: Record<string, any>) => {
    let facilityId = localStorage.getItem("facilityId");
    if (!facilityId) {
        const facilitiesStr = localStorage.getItem("facilities");
        if (facilitiesStr) {
            const facilities = JSON.parse(facilitiesStr);
            if (Array.isArray(facilities) && facilities.length > 0) {
                facilityId = (facilities[0].id) as string;
                localStorage.setItem("facilityId", facilityId);
            }
        }
    }
    if (facilityId) { 
        if (!queryParams) { 
            queryParams = {};
        }
        queryParams.facilityId = facilityId;
    }
    return `${config.apiUrl}/${path}${queryParams ? `?${stringify(queryParams)}` : ""}`;
};

/**
 * Maps react-admin queries to a json-server powered REST API
 *
 * @see https://github.com/typicode/json-server
 *
 * @example
 *
 * getList          => GET http://my.api.url/posts?order={ id: "ASC" }&range=[0, 24]
 * getOne           => GET http://my.api.url/posts/123
 * getManyReference => GET http://my.api.url/posts?author_id=345
 * getMany          => GET http://my.api.url/posts?id=123&id=456&id=789
 * create           => POST http://my.api.url/posts/123
 * update           => PUT http://my.api.url/posts/123
 * updateMany       => PUT http://my.api.url/posts/123, PUT http://my.api.url/posts/456, PUT http://my.api.url/posts/789
 * delete           => DELETE http://my.api.url/posts/123
 *
 * @example
 *
 * import * as React from "react";
 * import { Admin, Resource } from 'react-admin';
 * import jsonServerProvider from 'ra-data-json-server';
 *
 * import { PostList } from './posts';
 *
 * const App = () => (
 *     <Admin dataProvider={jsonServerProvider('http://jsonplaceholder.typicode.com')}>
 *         <Resource name="posts" list={PostList} />
 *     </Admin>
 * );
 *
 * export default App;
 */
export const httpDataProvider = (): DataProvider => {
    return {
        getList: async (resource, params) => {
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;
            const filter = {
                ...fetchUtils.flattenObject(params.filter),
                sort: JSON.stringify([field, order]),
                range: JSON.stringify([(page - 1) * perPage, (page * perPage)-1]),
            };
            const { headers, json } = await http(buildHttpUrl(resource, filter));
            if (!headers.has("content-range")) {
                throw new Error(
                    "The content-range header is missing in the HTTP Response. The jsonServer Data Provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare content-range in the Access-Control-Expose-Headers header?"
                );
            }
            return {
                data: overrideIdWithIdentity(json),
                total: parseInt(
                    headers.get("content-range")!.split("/").pop()!,
                    10
                )
            };
        },
        getOne: async (resource, params) => {
            const { json } = await http(buildHttpUrl(`${resource}/${params.id}`));
            return {
                data: overrideIdWithIdentity(json)
            };
        },
        getMany: async (resource, params) => {
            const filter = {
                id: params.ids,
            };
            const { json } = await http(buildHttpUrl(resource, filter));
            return {
                data: overrideIdWithIdentity(json)
            };
        },
        getManyReference: async (resource, params) => {
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;
            const filter = {
                ...fetchUtils.flattenObject(params.filter),
                [params.target]: params.id,
                sort: JSON.stringify([field, order]),
                range: JSON.stringify([(page - 1) * perPage, (page * perPage)-1])
            };
            const { headers, json } = await http(buildHttpUrl(resource, filter));
            if (!headers.has("content-range")) {
                throw new Error(
                    "The content-range header is missing in the HTTP Response. The jsonServer Data Provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare content-range in the Access-Control-Expose-Headers header?"
                );
            }
            return {
                data: overrideIdWithIdentity(json),
                total: parseInt(
                    headers.get("content-range")!.split("/").pop()!,
                    10
                ),
            };
        },
        update: async (resource, params) => {
            const { json } = await http(buildHttpUrl(`${resource}/${params.id}`), {
                method: "PUT",
                body: JSON.stringify(params.data),
            });
            return {
                data: overrideIdWithIdentity(json)
            };
        },
        // json-server doesn't handle filters on UPDATE route, so we fallback to calling UPDATE n times instead
        updateMany: async (resource, params) => {
            const responses = await Promise.all(
                params.ids.map(id => http(buildHttpUrl(`/${resource}/${id}`), {
                    method: "PUT",
                    body: JSON.stringify(params.data),
                }))
            );
            return {
                data: responses.map(({ json }) => overrideIdWithIdentity(json).id)
            };
        },
        create: async (resource, params) => {
            const { json } = await http(buildHttpUrl(resource), {
                method: "POST",
                body: JSON.stringify(params.data),
            });
            return {
                data: {
                    ...params.data,
                    id: overrideIdWithIdentity(json).id
                } as any
            };
        },
        delete: async (resource, params) => {
            const { json } = await http(buildHttpUrl(`${resource}/${params.id}`), {
                method: "DELETE",
            });
            return {
                data: overrideIdWithIdentity(json)
            };
        },
        // json-server doesn't handle filters on DELETE route, so we fallback to calling DELETE n times instead
        deleteMany: async (resource, params) => {
            const responses = await Promise.all(
                params.ids.map(id =>
                    http(buildHttpUrl(`${resource}/${id}`), {
                        method: "DELETE",
                    })
                )
            );
            return {
                data: responses.map(({ json }) => overrideIdWithIdentity(json).id)
            };
        }
    };
};
