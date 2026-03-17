import { Category } from "../../models";
import { EntityManager } from "typeorm";
import { CategoryRepository, RepositoryProvider } from "../repositories";

export class CategoryService {

    private readonly repositoryProvider: RepositoryProvider;
    private readonly categoryRepo: CategoryRepository;

    public constructor(manager: EntityManager) {
        this.repositoryProvider = new RepositoryProvider(manager);
        this.categoryRepo = this.repositoryProvider.getCustomRepository(Category, CategoryRepository);
    }

    protected async create(companyId: number, categoryBody: Partial<Category>): Promise<Category> {
        const category = Category.create(companyId, categoryBody);
        return category;
    }

}