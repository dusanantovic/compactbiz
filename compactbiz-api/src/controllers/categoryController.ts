import { Category } from "../../models";
import { Controller } from "routing-controllers";
import { BaseController } from "./baseController";
import { CategoryRepository } from "../repositories";

@Controller()
export class CategoryController extends BaseController {

    private readonly categoryRepo: CategoryRepository;

    public constructor() {
        super();
        this.categoryRepo = this.repositoryProvider.getCustomRepository(Category, CategoryRepository);
    }

}