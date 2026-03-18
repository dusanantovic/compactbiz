import { TranslationMessages } from "react-admin";
import englishMessages from "ra-language-english";

const customEnglishMessages: TranslationMessages = {
    ...englishMessages,
    resources: {
        dashboard: {
            name: "Dashboard",
            pendingOrders: "Pending Orders",
            inProgressOrders: "In Progress",
            completedOrders: "Completed Orders",
            canceledOrders: "Canceled Orders",
            sellRevenue: "Total Sales Revenue",
            purchaseCost: "Total Purchase Cost",
            totalProducts: "Total Products",
            lowStockProducts: "Low Stock Alerts",
            recentOrders: "Recent Orders",
            topProducts: "Top Selling Products",
            lowStock: "Low Stock Products",
        },
        users: {
            name: "User |||| Users",
        },
        orders: {
            name: "Order |||| Orders",
            addNewProduct: "Add new order",
            searchAside: "Search by #ID or Partner",
            type: "Type",
            total: "Total",
            status: "Status",
            business: {
                name: "Partner"
            }
        },
        facilities: {
            name: "Facility |||| Facilities",
            addNewFacility: "Add new facility",
            searchAside: "Search by name",
        },
        brands: {
            name: "Brand |||| Brands",
            searchAside: "Search by Name",
            addNewBrand: "Add new brand"
        },
        products: {
            name: "Product |||| Products",
            addNewProduct: "Add new product",
            searchAside: "Search by Name"
        },
        inventory: {
            name: "Inventory"
        },
        mycompany: {
            name: "My Company"
        },
        admin: {
            name: "Admin"
        },
        adminstaff: {
            name: "User |||| Users",
            searchAside: "Search by Email, First name or Last Name",
            addNewUser: "Add new user",
        },
        companies: {
            name: "Companies",
            addNewCompany: "Add new company",
            searchAside: "Search by Name"
        },
        staff: {
            name: "Staff |||| Staff",
            searchAside: "Search by Email, Phone, First name or Last Name",
            addNewStaffMember: "Add new staff member"
        },
        businesses: {
            name: "Business |||| Businesses",
            searchAside: "Search by Name",
            addNewBusiness: "Add new business"
        },
        misc: {
            business: "Business |||| Businesses",
            partner: "Partner |||| Partners",
            phone: "Phone |||| Phones",
            verified: "Verified |||| Verified",
            name: "Name |||| Names",
            firstName: "First name",
            lastName: "Last name",
            filters: "Filter |||| Filters",
            search: "Search |||| Search",
            password: "Password",
            data: "Data",
            role: "Role",
            type: "Type",
            price: "Price",
            lastPrice: "Last used price",
            purchase: "Purchase",
            sell: "Sell",
            both: "Both",
            warehouseman: "Warehouseman",
            driver: "Driver",
            cashier: "Cashier",
            sales: "Sales",
            inventoryManager: "Inventory manager",
            manager: "Manager",
            owner: "Owner",
            quantity: "Quantity |||| Quantities",
            product: "Product |||| Products",
            item: "Item |||| Items",
            detail: "Detail |||| Details",
            notes: "Note |||| Notes",
            active:"Active |||| Active",
            paused:"Paused |||| Paused",
            inactive:"Inactive |||| Inactive",
            history: "History",
            facility: "Facility |||| Facilities",
            company: "Company |||| Companies",
            address: "Address",
            country: "Country",
            city: "City",
            street: "Street",
            streetNumber: "Street number",
            zip: "ZIP",
            submit: "Submit",
            orderSubmitted: "Order submitted",
            readyToPack: "Ready to pack",
            orderStarted: "Order moved to in progress",
            readyForDelivery: "Ready for delivery",
            orderDelivery: "Order moved to delivery",
            complete: "Complete",
            orderCompleted: "Order completed",
        }
    }
};

export default customEnglishMessages;