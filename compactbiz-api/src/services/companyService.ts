import { EntityManager } from "typeorm";
import { Company } from "../../models";
import { CompanyKey } from "../../models/interfaces";
import { assert } from "../../models/src/util";
import { CompanyRepository, LocationRepository, RepositoryProvider } from "../repositories";

export class CompanyService {

    private readonly repositoryProvider: RepositoryProvider;
    private readonly companyRepo: CompanyRepository;
    private readonly locationRepo: LocationRepository;
    private readonly manager: EntityManager;

    public constructor(manager: EntityManager) {
        this.repositoryProvider = new RepositoryProvider(manager);
        this.companyRepo = this.repositoryProvider.getCustomRepository(Company, CompanyRepository);
        this.manager = manager;
    }

    public async create(companyId: number, facilityId: number, userId: number, companyBody: Partial<Company>): Promise<Company> {
        const companyName = companyBody.name && companyBody.name.trim();
        assert(companyName, ["Missing company name"]);
        const [companies] = await this.companyRepo.browse(companyId, {
            where: {
                name: companyName
            }
        });
        assert(companies.length === 0, [`Company with name "${companyName}" already exists`]);
        const company = Company.create(companyBody);
        const savedCompany = await this.companyRepo.save(company);

        return savedCompany;
    }

    public async update(companyKey: CompanyKey, companyBody: Partial<Company>): Promise<Company> {
        const companyDb = await this.companyRepo.browseOne(companyKey);
        assert(companyDb, ["Company doesn't exist"]);
        companyDb.update(companyBody);
        const updatedCompany = await this.companyRepo.save(companyDb);
        return updatedCompany;
    }

}