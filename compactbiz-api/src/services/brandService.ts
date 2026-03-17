import { assert } from "../../models/src/util";
import { BrandKey } from "../../models/interfaces";
import { Brand } from "../../models";
import { EntityManager } from "typeorm";
import { BrandRepository, RepositoryProvider } from "../repositories";

export class BrandService {

    private readonly repositoryProvider: RepositoryProvider;
    private readonly brandRepo: BrandRepository;

    public constructor(manager: EntityManager) {
        this.repositoryProvider = new RepositoryProvider(manager);
        this.brandRepo = this.repositoryProvider.getCustomRepository(Brand, BrandRepository);
    }

    public async create(companyId: number, brandBody: Partial<Brand>): Promise<Brand> {
        const brandName = brandBody.name && brandBody.name.trim();
        assert(brandName, ["Missing brand name"]);
        const [brands] = await this.brandRepo.browse(companyId, {
            where: {
                name: brandName
            }
        });
        assert(brands.length === 0, [`Brand with name "${brandName}" already exists`]);
        const brand = Brand.create(companyId, brandBody);
        const savedBrand = await this.brandRepo.save(brand);
        return savedBrand;
    }

    public async update(companyId: number, brandKey: BrandKey, brandBody: Partial<Brand>): Promise<Brand> {
        brandKey.companyId = companyId;
        const brandDb = await this.brandRepo.browseOne(brandKey);
        assert(brandDb, ["Brand doesn't exist"]);
        brandDb.update(brandBody);
        const updatedBrand = await this.brandRepo.save(brandDb);
        return updatedBrand;
    }

}