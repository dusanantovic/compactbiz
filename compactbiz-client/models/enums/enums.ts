export enum CompanyStatus {
    Active = "Active",
    Paused = "Paused",
    Inactive = "Inactive",
    Demo = "Demo"
}

export enum OrderAction {
    PurchaseCreated = "PurchaseCreated",
    SellCreated = "SellCreated",
    Updated = "Updated",
    StatusChanged = "StatusChanged"
}

export enum Role {
    Guest = 0,
    Warehouseman = 2,
    Driver = 4,
    Cashier = 8,
    Sales = 14,
    InventoryManager = 16,
    Manager = 512,
    Owner = 2048,
    Admin = 4096
}

export enum LocationType {
    Room = "Room",
    Vehicle = "Vehicle"
}

export enum DeleteType {
    Hard = "Hard",
    Soft = "Soft"
}

export enum MeasurementUnit {
    Gram = "g",
    Kilogram = "kg",
    Milligram = "mg",
    Tonne = "tonne",
    Ounce = "oz",
    Pound = "lb",
    Milliliter = "ml",
    Liter = "l",
    Centiliter = "cl",
    Gallon = "gal",
    FluidOunce = "fl oz",
    Piece = "pcs"
}

export enum OrderType {
    Purchase = "Purchase",
    Sell = "Sell"
}

export enum ProductType {
    Purchase = "Purchase",
    Sell = "Sell",
    Both = "Both"
}

export enum OrderStatus {
    Temporary = "Temporary",
    Pending = "Pending",
    InProgress = "InProgress",
    Delivery = "Delivery",
    Complete = "Complete",
    Canceled = "Canceled",
    Refunded = "Refunded",
    Paused = "Paused"
}

export enum PackageAdjustmentType {
    PurchaseOrder = "PurchaseOrder",
    SellOrder = "SellOrder",
    CreateProduct = "CreateProduct"
}