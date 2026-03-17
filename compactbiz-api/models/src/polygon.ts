import { Type } from "class-transformer";
import { Point } from "./point";

export class Polygon {

    public constructor() {
        // Empty
    }

    @Type(() => Point)
    points: Point[];

    public toString(): string {
        return `(${this.points.join(",")})`;
    }

    public static parse(str: string): Polygon {
        const points = (JSON.parse(str.replace(/\(/g, "[").replace(/\)/g, "]")) as [number, number][])
            .map(x => {
                const p = new Point();
                p.lat = x[0];
                p.lng = x[1];
                return p;
            });
        const poly = new Polygon();
        poly.points = points;
        return poly;
    }

}