import { Type } from "class-transformer";
import { BadRequestError } from "routing-controllers";
import { AfterInsert, AfterLoad, AfterUpdate, BeforeInsert, BeforeUpdate, CreateDateColumn } from "typeorm";

export abstract class BaseModel<T> {

    public _id: string;

    public constructor() {
        // Emplty
    }

    @CreateDateColumn({ type: "timestamptz" })
    @Type(() => Date)
    created: Date;

    @CreateDateColumn({ type: "timestamptz" })
    @Type(() => Date)
    lastModified: Date;

    @BeforeInsert()
    @BeforeUpdate()
    public setLastModified(): void {
        this.lastModified = new Date();
    }

    @AfterInsert()
    @AfterUpdate()
    @AfterLoad()
    set_Id(): void {
        this._id = this.identity;
    }

    abstract get identity(): string;

    abstract get key(): T;

    protected generateIdentity(...values: number[]): string {
        return values.join("-");
    }

    protected static parseIdentity<T>(identity: string, ...keys: (keyof T)[]): T {
        const splitIdentity = this.splitIdentity(identity);
        if (splitIdentity.length !== keys.length) {
            throw new BadRequestError(JSON.stringify(["Invalid credentials"]));
        }
        const compositeKey = {} as T;
        keys.forEach((key, i) => {
            compositeKey[key] = splitIdentity[i];
        });
        return compositeKey;
    }

    private static splitIdentity<T>(identity: string): T[keyof T][] {
        return identity.split("-").map(x => parseInt(x)) as T[keyof T][];
    }

}