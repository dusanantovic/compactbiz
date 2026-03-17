import { assert } from "../../models/src/util";
import { BusinessKey } from "../../models/interfaces";
import { Business } from "../../models";
import { EntityManager } from "typeorm";
import { BusinessRepository, RepositoryProvider } from "../repositories";

export class BusinessService {

    private readonly repositoryProvider: RepositoryProvider;
    private readonly businessRepo: BusinessRepository;

    public constructor(manager: EntityManager) {
        this.repositoryProvider = new RepositoryProvider(manager);
        this.businessRepo = this.repositoryProvider.getCustomRepository(Business, BusinessRepository);
    }

    public async create(companyId: number, businessBody: Partial<Business>): Promise<Business> {
        const businessName = businessBody.name && businessBody.name.trim();
        assert(businessName, ["Missing business name"]);
        const [businesses] = await this.businessRepo.browse(companyId, {
            where: {
                name: businessName
            }
        });
        assert(businesses.length === 0, [`Business with name "${businessName}" already exists`]);
        const business = Business.create(companyId, businessBody);
        const savedBusiness = await this.businessRepo.save(business);
        return savedBusiness;
    }

    public async update(companyId: number, businessKey: BusinessKey, businessBody: Partial<Business>): Promise<Business> {
        businessKey.companyId = companyId;
        const businessDb = await this.businessRepo.browseOne(businessKey);
        assert(businessDb, ["Business doesn't exist"]);
        businessDb.update(businessBody);
        const updatedBusiness = await this.businessRepo.save(businessDb);
        return updatedBusiness;
    }

}