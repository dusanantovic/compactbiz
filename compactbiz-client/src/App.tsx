import "reflect-metadata";
import React from "react";
import { Admin, Authenticated, CustomRoutes, Resource } from "react-admin";
import { HashRouter, Route } from "react-router-dom";
import polyglotI18nProvider from "ra-i18n-polyglot";
import { httpDataProvider } from "./httpDataProvider";
import { authProvider } from "./authProvider";
import { LoginPage } from "./pages/login";
import { theme } from "./theme";
import { BizLayout } from "./layout";
import { UserList, UserCreate, UserEdit } from "./pages/users";
import { BrandList, BrandCreate, BrandEdit } from "./pages/brands";
import { ProductCreate, ProductEdit, ProductList } from "./pages/products";
import { FacilityCreate, FacilityEdit, FacilityList } from "./pages/facilities";
import english from "./i18n/english";
import { BusinessCreate, BusinessEdit, BusinessList } from "./pages/business";
import { ProfilePage } from "./pages/customPage/profile";
import { MyCompanyPage } from "./pages/customPage/myCompanyPage";
import { CompanyCreate, CompanyEdit, CompanyList } from "./pages/company";
import { OrderList, OrderCreate, OrderEdit } from "./pages/orders";
import { AdminUserCreate, AdminUserList } from "./pages/adminUsers";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { Role } from "models/enums";

const dataProvider = httpDataProvider();

const i18nProvider = polyglotI18nProvider(
    locale => {
        if (locale === "sr") {
            return import("./i18n/serbian").then(messages => messages.default);
        }
        // Always fallback on english
        return english;
    },
    "en",
    [
        { locale: "en", name: "English" },
        { locale: "sr", name: "Serbian" },
    ]
);

const App = () => {
    return (
        <HashRouter>
            <Admin
                layout={(props) => <BizLayout {...props} />}
                loginPage={LoginPage}
                authProvider={authProvider}
                dataProvider={dataProvider}
                theme={theme}
                i18nProvider={i18nProvider}
                dashboard={Dashboard}
            >
                {(permissions: Role | null) => (
                    <>
                        <CustomRoutes>
                            <Route path={ProfilePage.path} element={<Authenticated><ProfilePage /></Authenticated>} />
                            <Route path={MyCompanyPage.path} element={<Authenticated><MyCompanyPage /></Authenticated>} />
                        </CustomRoutes>
                        <Resource
                            name="users/staff"
                            list={UserList}
                            create={UserCreate}
                            edit={UserEdit}
                            options={{
                                key: 1,
                                label: "Staff",
                                visible: permissions && [Role.Manager, Role.Owner, Role.Admin].includes(permissions)
                            }}
                        />
                        <Resource
                            name="products"
                            list={ProductList}
                            create={ProductCreate}
                            edit={ProductEdit}
                            options={{
                                key: 2,
                                label: "Products",
                                visible: permissions !== Role.Warehouseman && permissions !== Role.Cashier && permissions !== Role.Driver
                            }}
                        />
                        <Resource
                            name="orders"
                            list={OrderList}
                            create={OrderCreate}
                            edit={OrderEdit}
                            options={{
                                key: 3,
                                label: "Orders",
                                visible: true
                            }}
                        />
                        <Resource
                            name="brands"
                            list={BrandList}
                            create={BrandCreate}
                            edit={BrandEdit}
                            options={{
                                key: 4,
                                label: "Brands",
                                visible: permissions !== Role.Warehouseman && permissions !== Role.Cashier && permissions !== Role.Driver
                            }}
                        />
                        <Resource
                            name="facilities"
                            list={FacilityList}
                            create={FacilityCreate}
                            edit={FacilityEdit}
                            options={{
                                key: 5,
                                label: "Facilities",
                                visible: permissions !== null && [Role.Manager, Role.Owner].includes(permissions)
                            }}
                        />
                        <Resource
                            name="businesses"
                            list={BusinessList}
                            create={BusinessCreate}
                            edit={BusinessEdit}
                            options={{
                                key: 6,
                                label: "Businesses",
                                visible: permissions !== Role.Warehouseman && permissions !== Role.Cashier && permissions !== Role.Driver
                            }}
                        />
                        <Resource
                            name="myCompany"
                            options={{
                                key: 7,
                                label: "MyCompany",
                                visible: permissions !== null && [Role.Manager, Role.Owner].includes(permissions)
                            }}
                        />
                        {permissions === Role.Admin && (
                            <Resource
                                name="companies"
                                list={CompanyList}
                                create={CompanyCreate}
                                edit={CompanyEdit}
                                options={{
                                    key: 8,
                                    label: "Companies",
                                    visible: true,
                                    nested: "Admin",
                                    nestedKey: 1
                                }}
                            />
                        )}
                        {permissions === Role.Admin && (
                            <Resource
                                name="adminstaff"
                                list={AdminUserList}
                                create={AdminUserCreate}
                                options={{
                                    key: 9,
                                    label: "Adminstaff",
                                    visible: true,
                                    nested: "Admin",
                                    nestedKey: 2
                                }}
                            />
                        )}
                    </>
                )}
            </Admin>
        </HashRouter>
    );
};

export default App;