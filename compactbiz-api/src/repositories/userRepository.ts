import { User } from "../../models";
import { UserKey } from "../../models/interfaces";
import { BaseRepository } from "./baseRepository";
import { Brackets, EntityManager, EntityTarget, SelectQueryBuilder } from "typeorm";
import { FindManyOptionsStrict } from "../controllers/baseController";

export class UserRepository extends BaseRepository<User> {

    public constructor(target: EntityTarget<User>, manager: EntityManager) {
        super(target, manager);
    }

    public browse(options: FindManyOptionsStrict<User>, companyId?: number, facilityId?: number): SelectQueryBuilder<User> {
        const qb = this.browseByOptions(options);
        if (facilityId && companyId) {
            qb.innerJoin("facility_staff", "fs", `fs."userId" = ${qb.alias}.id AND fs."facilityId" = :facilityId AND fs."companyId" = :companyId`, { facilityId, companyId });
        } else if (companyId) {
            qb.andWhere(`${qb.alias}."employeedById" = :companyId`, { companyId });
        }
        if (options.q) {
            this.search(qb, options.q);
        }
        return qb;
    }

    public async getUserSpecFields(userKey: UserKey, ...fields: Array<keyof User>): Promise<Partial<User> | undefined> {
        const qb = this.createQueryBuilder("u");
        if (fields.length > 0) {
            qb.select(fields.map(x => `u."${x}"`).join(", "));
        } else {
            qb.select(
                `u.password,
                u."tempPin",
                u."tempPinExpirationDate"`
            );
        }
        qb.where(`u.id = :id`, {
            id: userKey.id
        });
        return qb.getRawOne();
    }

    private search(qb: SelectQueryBuilder<User>, value: string): SelectQueryBuilder<User> {
        const brackets = new Brackets(ex => {
            const likeFirstName = this.getWhereLike(qb.alias, "firstName", value);
            ex.where(likeFirstName.where, likeFirstName.params);
            const likeMiddleName = this.getWhereLike(qb.alias, "middleName", value);
            ex.orWhere(likeMiddleName.where, likeMiddleName.params);
            const likeLastName = this.getWhereLike(qb.alias, "lastName", value);
            ex.orWhere(likeLastName.where, likeLastName.params);
            const likePhone = this.getWhereLike(qb.alias, "phone", value);
            ex.orWhere(likePhone.where, likePhone.params);
            const likeEmail = this.getWhereLike(qb.alias, "email", value);
            ex.orWhere(likeEmail.where, likeEmail.params);
        });
        return qb.andWhere(brackets);
    }

}