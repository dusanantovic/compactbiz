import { sum } from "./util";

export class Point {

    public constructor() {
        // Empty
    }

    public lat = 0;
    public lng = 0;

    public toString(): string {
        return `(${this.lat},${this.lng})`;
    }

    public static distance(from: Point, to: Point): number {
        return Math.sqrt(Math.pow(to.lat - from.lat, 2) + Math.pow(to.lng - from.lng, 2));
    }

    public static parse(str: string): Point {
        const arr = str.substring(1, str.length).split(",");
        const p = new Point();
        p.lat = parseFloat(arr[0]);
        p.lng = parseFloat(arr[1]);
        return p;
    }

    public static centroid(array: Point[]): Point {
        const lat = sum(array, x => x.lat) / array.length;
        const lng = sum(array, x => x.lng) / array.length;
        const point = new Point();
        point.lat = lat;
        point.lng = lng;
        return point;
    }

}