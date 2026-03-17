import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";
import { IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";
import { BaseModel } from "./baseModel";
import { validator } from "./util";

@Entity()
@Unique("company_category_name", ["companyId", "name"])
export class Category extends BaseModel<CategoryKey> implements CategoryKey {

    public constructor() {
        super();
    }

    @PrimaryColumn()
    companyId: number;

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Category name is required" })
    name: string;

    @Column({ nullable: true })
    parentId?: number;

    @OneToOne(() => Category, c => c.parent)
    @Type(() => Category)
    @JoinColumn([{
        name: "companyId", referencedColumnName: "companyId",
    },{
        name: "parentId", referencedColumnName: "id"
    }])
    child?: Category;

    @OneToOne(() => Category, o => o.child)
    @Type(() => Category)
    parent?: Category;

    public get identity(): string {
        return this.generateIdentity(this.companyId, this.id);
    }

    public get key(): CategoryKey {
        return {
            companyId: this.companyId,
            id: this.id
        };
    }

    public static parse(identity: string): CategoryKey {
        return this.parseIdentity(identity, "companyId", "id");
    }

    public static create(companyId: number, categoryBody: Partial<Category>): Category {
        const category = new Category();
        category.companyId = companyId;
        category.name = categoryBody.name ? (categoryBody.name.trim() || null) : null as any;
        category.parentId = categoryBody.parentId || null as any;
        validator(category);
        return category;
    }

    public update(categoryBody: Partial<Category>): void {
        this.name = categoryBody.name ? (categoryBody.name.trim() || null) : null as any;
        validator(this);
    }

}

export interface CategoryKey {
    companyId: number;
    id: number;
}