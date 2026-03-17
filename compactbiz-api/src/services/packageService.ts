import { EntityManager, In } from "typeorm";
import { PackageAdjustmentType } from "../../models/enums";
import { Package, PackageAdjustment, PackageQuantity } from "../../models";
import { assert, distinct } from "../../models/src/util";
import { PackageAdjustmentRepository, PackageQuantityRepository, PackageRepository, RepositoryProvider } from "../../src/repositories";

export class PackageService {

    private readonly repositoryProvider: RepositoryProvider;
    private readonly packageRepo: PackageRepository;
    private readonly packageQuantityRepo: PackageQuantityRepository;
    private readonly packageAdjustmentRepo: PackageAdjustmentRepository;

    public constructor(manager: EntityManager) {
        this.repositoryProvider = new RepositoryProvider(manager);
        this.packageRepo = this.repositoryProvider.getCustomRepository(Package, PackageRepository);
        this.packageQuantityRepo = this.repositoryProvider.getCustomRepository(PackageQuantity, PackageQuantityRepository);
        this.packageAdjustmentRepo = this.repositoryProvider.getCustomRepository(PackageAdjustment, PackageAdjustmentRepository);
    }

    public async createProduct(companyId: number, facilityId: number, userId: number, defaultLocationId: number, productId: number, quantity: number, label?: string, expiration?: Date): Promise<Package> {
        return (await this.create(
            companyId,
            facilityId,
            userId,
            defaultLocationId, [{
                productId,
                quantity,
                expiration,
                label
            }],
            PackageAdjustmentType.CreateProduct,
            `New product #${productId}`
        ))[0];
    }

    public async createPurchaseOrder(companyId: number, facilityId: number, userId: number, defaultLocationId: number, businessId: number, orderId: number, productPackageQuantities: ProductPackageQuantity[]): Promise<Package[]> {
        return this.create(
            companyId,
            facilityId,
            userId,
            defaultLocationId,
            productPackageQuantities.map(x => ({
                ...x,
                quantity: x.quantity < 0 ? x.quantity * -1 : x.quantity
            })),
            PackageAdjustmentType.PurchaseOrder,
            `New purchase order #${orderId}`,
            businessId,
            orderId
        );
    }

    public async createSellOrder(companyId: number, facilityId: number, userId: number, defaultLocationId: number, businessId: number, orderId: number, productPackageQuantities: ProductPackageQuantity[]): Promise<Package[]> {
        const packagesDb = await this.packageRepo.find({
            where: {
                companyId,
                facilityId,
                productId: In(productPackageQuantities.map(x => x.productId))
            }
        });
        let packageQuantities: PackageQuantity[] = [];
        if (packagesDb.length > 0) {
            packageQuantities = await this.packageQuantityRepo.find({
                where: {
                    companyId,
                    facilityId,
                    locationId: defaultLocationId,
                    packageId: In(packagesDb.map(x => x.id))
                }
            });
        }
        const errors: string[] = [];
        productPackageQuantities.forEach(x => {
            const pkg = packagesDb.find(y => y.productId === x.productId);
            if (!pkg) {
                errors.push(`There is no package for product #${x.productId}`);
            } else {
                const packageQuantity = packageQuantities.find(y => y.packageId === pkg.id);
                if (!packageQuantity || x.quantity > (packageQuantity.quantity - packageQuantity.reserved)) {
                    errors.push(`Product #${x.productId} does not have sufficient quantity to sell`);
                }
            }
        });
        assert(errors.length === 0, errors);
        return this.create(
            companyId,
            facilityId,
            userId,
            defaultLocationId,
            productPackageQuantities.map(x => ({
                ...x,
                quantity: x.quantity > 0 ? x.quantity * -1 : x.quantity
            })),
            PackageAdjustmentType.SellOrder,
            `New sell order #${orderId}`,
            businessId,
            orderId
        );
    }

    private async create(companyId: number, facilityId: number, userId: number, defaultLocationId: number, productPackageQuantities: ProductPackageQuantity[], type: PackageAdjustmentType, note: string, businessId?: number, orderId?: number): Promise<Package[]> {
        assert(productPackageQuantities.length > 0, ["Missing product package quantities"]);
        const packagesDb = await this.packageRepo.find({
            where: {
                companyId,
                facilityId,
                productId: In(distinct(productPackageQuantities.map(x => x.productId), x => x))
            }
        });
        let newPackages: Package[] = [];
        const existingPackages: Package[] = [];
        productPackageQuantities.forEach(x => {
            const packageDb = packagesDb.find(y => y.productId === x.productId);
            if (packageDb) {
                // Package update depending if order is purchase or sale (Delta will be negative for sale and positive for puchase order)
                existingPackages.push(packageDb);
            } else {
                // Package for new product
                const newPackage = Package.create(companyId, facilityId, {
                    productId: x.productId,
                    label: x.label,
                    expiration: x.expiration
                }, x.quantity);
                newPackage.temporary = false;
                newPackages.push(newPackage);
            }
        });
        newPackages = await this.packageRepo.save(newPackages);
        const newPackageQuantities: PackageQuantity[] = [];
        let newPackageAdjustments: PackageAdjustment[] = [];
        existingPackages.forEach(x => {
            const productPackageQuantity = productPackageQuantities.find(y => y.productId === x.productId)!;
            const newPackageAdjustment = PackageAdjustment.create(companyId, facilityId, x.id, defaultLocationId, userId, productPackageQuantity.quantity, type, note, businessId, orderId);
            newPackageAdjustments.push(newPackageAdjustment);
        });
        newPackages.forEach(x => {
            const packageQuantity = PackageQuantity.create(companyId, facilityId, x.id, defaultLocationId, true);
            const newPackageAdjustment = PackageAdjustment.create(companyId, facilityId, x.id, defaultLocationId, userId, x.quantity, type, note, businessId, orderId);
            newPackageQuantities.push(packageQuantity);
            newPackageAdjustments.push(newPackageAdjustment);
        });
        await this.packageQuantityRepo.save(newPackageQuantities);
        newPackageAdjustments = await this.packageAdjustmentRepo.save(newPackageAdjustments);
        const savedPackages = [...existingPackages, ...newPackages];
        savedPackages.forEach(x => {
            const packageAdjustment = newPackageAdjustments.find(y => y.packageId === x.id && y.locationId === defaultLocationId)!;
            x.quantity += packageAdjustment.delta;
        });
        return savedPackages;
    }

}

interface ProductPackageQuantity {
    productId: number;
    quantity: number;
    label?: string;
    expiration?: Date;
}