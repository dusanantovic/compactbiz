import { Column } from "typeorm";

export class Address {

    public constructor() {
        // Empty
    }

    @Column({ nullable: true })
    country?: string;

    @Column({ nullable: true })
    city?: string;

    @Column({ nullable: true })
    street?: string;

    @Column({ nullable: true })
    streetNumber?: string;

    @Column({ nullable: true })
    zip?: number;

    public static create(addressBody?: Partial<Address>): Address {
        const address = new Address();
        if (addressBody) {
            address.country = addressBody.country || null as any;
            address.city = addressBody.city || null as any;
            address.street = addressBody.street || null as any;
            address.streetNumber = addressBody.streetNumber || null as any;
            address.zip = addressBody.zip || null as any;
            if (!address.isValid()) {
                address.erase();
            }
        }
        return address;
    }

    public update(addressBody?: Partial<Address>): void {
        this.country = addressBody && addressBody.country || null as any;
        this.city = addressBody && addressBody.city || null as any;
        this.street = addressBody && addressBody.street || null as any;
        this.streetNumber = addressBody && addressBody.streetNumber || null as any;
        this.zip = addressBody && addressBody.zip || null as any;
        if (!this.isValid()) {
            this.erase();
        }
    }

    public isValid(): boolean {
        return !!(
            !!(this.country && this.country.trim()) &&
            !!(this.city && this.city.trim()) &&
            !!(this.street && this.street.trim()) &&
            !!(this.streetNumber && this.streetNumber.trim()) &&
            typeof this.zip === "number"
        );
    }

    private erase(): void {
        this.country = null as any;
        this.city = null as any;
        this.street = null as any;
        this.streetNumber = null as any;
        this.zip = null as any;
    }

}