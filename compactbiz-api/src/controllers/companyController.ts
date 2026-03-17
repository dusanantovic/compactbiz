import { Company, Facility, Location } from "../../models";
import { assert, trimAndLowerCase, throwError } from "../../models/src/util";
import { LocationType, Role, CompanyStatus } from "../../models/enums";
import { MiniCompany } from "../../models/src/company";
import { Response } from "express";
import { Authorized, BadRequestError, Body, Controller, Delete, Get, Param, Post, Put, Res } from "routing-controllers";
import { BaseController } from "./baseController";
import { CompanyRepository, FacilityRepository, LocationRepository } from "../repositories";
import { FindOptionsWhere } from "typeorm";
import { AppCtx, Context } from "../../context";
import { NodeMailer } from "../services";
import { welcomeEmail } from "../emails";
import { CompanyService } from "../services";

@Controller()
export class CompanyController extends BaseController {

    private readonly companyRepo: CompanyRepository;

    public constructor() {
        super();
        this.companyRepo = this.repositoryProvider.getCustomRepository(Company, CompanyRepository);
    }

    @Post("/companies")
    @Authorized(Role.Admin)
    public async createCompany(@Body() companyBody: Partial<Company>): Promise<Company> {
        await this.companyUniqueValidation(companyBody);
        const savedCompany = await this.connection.transaction(async manager => {
            const facilityRepo = this.getRepositoryProvider(manager).getCustomRepository(Facility, FacilityRepository);
            const locationRepo = this.getRepositoryProvider(manager).getCustomRepository(Location, LocationRepository);
            const newCompany = Company.create(companyBody);
            const savedCompany = await manager.save(newCompany);
            const defaultFacility = Facility.create(savedCompany.id, {
                name: "Default Facility",
                email: savedCompany.email,
            });
            const savedFacility = await facilityRepo.save(defaultFacility);
            const defaultLocation = Location.create(savedFacility.companyId, savedFacility.id, {
                name: "Default Room",
                isActive: true,
                type: LocationType.Room,
            });
            await locationRepo.save(defaultLocation);
            return savedCompany;
        });
        const nodemailer = new NodeMailer();
        await nodemailer
            .to(savedCompany.email)
            .subject("Welcome")
            .html(welcomeEmail(savedCompany))
            .send();
        return savedCompany;
    }

    // @Put("/companies")
    // @Authorized(Role.Owner)
    // public async updateCompany(@Body() companyBody: Partial<Company>, @AppCtx() context: Context): Promise<Company> {
    //     const { company } = context.state;
    //     assert(company, ["Missing company"]);
    //     await this.companyUniqueValidation(companyBody, company);
    //     company.update(companyBody);
    //     const updateCompany = await this.companyRepo.save(company);
    //     return updateCompany;
    // }

    @Get("/companies/mini")
    @Authorized(Role.Admin)
    public async getMiniCompany(@AppCtx() context: Context): Promise<MiniCompany> {
        const { company } = context.state;
        assert(company, ["Missing company"]);
        const miniCompany = company.mini;
        return miniCompany;
    }

    @Get("/companies/:identity([-0-9]+)")
    @Authorized(Role.Owner)
    public async getOneUser(@Param("identity") identity: string, @AppCtx() context: Context): Promise<Company> {
        const { company, user } = context.state;
        assert(company, ["Missing company"]);
        const companyKey = Company.parse(identity);
        if (user?.role !== Role.Admin && company.id !== companyKey.id) {
            throw new BadRequestError("Company not matching");
        }
        const companyDb = await this.companyRepo.findOne({
            where: companyKey
        });
        assert(companyDb, ["Company doesn't exist"]);
        return companyDb;
    }

    @Put("/companies/:identity([-0-9]+)")
    @Authorized(Role.Owner)
    public async updateCompany(@Param("identity") identity: string, @Body() companyBody: Partial<Company>, @AppCtx() context: Context): Promise<Company> {
        const { company, user } = context.state;
        assert(company, ["Missing company"]);
        const companyKey = Company.parse(identity);
        if (user?.role !== Role.Admin && company.id !== companyKey.id) {
            throw new BadRequestError("Company not matching");
        }
        await this.companyUniqueValidation(companyBody, await this.companyRepo.findOne({ where: companyKey }) ?? undefined);
        const companyService = new CompanyService(this.connection.manager);
        const updatedCompany = await companyService.update(companyKey, companyBody);
        return updatedCompany;
    }

    @Delete("/companies/:identity([-0-9]+)")
    @Authorized(Role.Admin)
    public async makeCompanyInactive(@Param("identity") identity: string): Promise<Company> {
        const companyKey = Company.parse(identity);
        const companyDb = await this.companyRepo.findOne({ where: companyKey });
        assert(companyDb, ["Company doesn't exist"]);
        companyDb.changeStatus(CompanyStatus.Inactive);
        return await this.companyRepo.save(companyDb);
    }

    @Get("/companies")
    @Authorized(Role.Admin)
    public async getCompanies(@AppCtx() context: Context, @Res() response: Response): Promise<Company[]> {
        const options = this.extractQuery(context);
        const qb = this.companyRepo.browseByOptions(options);
        const [companies, count] = await qb.getManyAndCount();
        response.set("content-range", count.toString());
        return companies;
    }

    private async companyUniqueValidation(companyBody: Partial<Company>, currentCompany?: Company): Promise<void> {
        if (companyBody.name || companyBody.email ) {
            let nameBody = companyBody.name?.trim() || null;
            let emailBody = trimAndLowerCase(companyBody.email);
            if (currentCompany) {
                if (nameBody === currentCompany.name) {
                    nameBody = null;
                }
                if (emailBody === currentCompany.email) {
                    emailBody = null;
                }
            }
            if (nameBody || emailBody) {
                const companyByEmail = await this.companyRepo.findOne({
                    where: [
                        nameBody ? { name: nameBody } : null,
                        emailBody ? { email: emailBody } : null
                    ].filter(x => x) as FindOptionsWhere<Company>[]
                });
                if (companyByEmail) {
                    const errors: string[] = [];
                    if (companyByEmail.name === nameBody) {
                        errors.push(`Company with name (${nameBody}) already exist`);
                    }
                    if (companyByEmail.email === emailBody) {
                        errors.push(`Company with email (${emailBody}) already exist`);
                    }
                    if (errors.length > 0) {
                        throwError(errors);
                    }
                }
            }
        }
    }

}