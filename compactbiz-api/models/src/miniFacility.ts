import { Facility } from "./facility";

export class MiniFacility {

    readonly id: number;
    readonly companyId: number;
    readonly _id: string;
    readonly name: string;

    constructor(facility: Facility) {
        this.id = facility.id;
        this.companyId = facility.companyId;
        this._id = facility.identity;
        this.name = facility.name;
    }

}