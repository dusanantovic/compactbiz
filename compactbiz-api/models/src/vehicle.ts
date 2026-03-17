import { Column } from "typeorm";

export class Vehicle {

    public constructor() {
        // Empty
    }

    @Column({ nullable: true })
    make?: string;

    @Column({ nullable: true })
    model?: string;

    @Column({ nullable: true })
    year?: number;

    @Column({ nullable: true })
    licensePlate?: string;

    public static create(vehicleBody?: Partial<Vehicle>): Vehicle {
        const vehicle = new Vehicle();
        if (vehicleBody) {
            vehicle.make = vehicleBody.make || null as any;
            vehicle.model = vehicleBody.model || null as any;
            vehicle.licensePlate = vehicleBody.licensePlate || null as any;
            vehicle.year = vehicleBody.year || null as any;
            if (!vehicle.isValid()) {
                vehicle.erase();
            }
        }
        return vehicle;
    }

    public update(vehicleBody?: Partial<Vehicle>): void {
        this.make = vehicleBody && vehicleBody.make || null as any;
        this.model = vehicleBody && vehicleBody.model || null as any;
        this.licensePlate = vehicleBody && vehicleBody.licensePlate || null as any;
        this.year = vehicleBody && vehicleBody.year || null as any;
        if (!this.isValid()) {
            this.erase();
        }
    }

    public isValid(): boolean {
        return (
            !!(this.make && this.make.trim()) &&
            !!(this.model && this.model.trim()) &&
            !!(this.licensePlate && this.licensePlate.trim()) &&
            typeof this.year === "number"
        );
    }

    private erase(): void {
        this.make = null as any;
        this.model = null as any;
        this.year = null as any;
        this.licensePlate = null as any;
    }

}