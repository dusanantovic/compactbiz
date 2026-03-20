import * as React from "react";
import { MenuProps, ResourceDefinition, ResourceDefinitions, useResourceDefinitions, useTranslate } from "react-admin";
import { MenuContainer, MenuListItemButton, MenuListItemSubButton, MenuListItemSubText, MenuListItemText, MenuGroupHeader, MenuGroupLabel } from "./styledComponents";
import { order } from "../../../models/src/util";
import { Link, useLocation } from "react-router-dom";
import { Collapse, List, ListItemIcon } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { FacilitySelector } from "./components/FacilitySelector";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import BusinessIcon from "@mui/icons-material/Business";
import GroupsIcon from "@mui/icons-material/Groups";
import ApartmentIcon from "@mui/icons-material/Apartment";
import DomainIcon from "@mui/icons-material/Domain";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import CircleIcon from "@mui/icons-material/Circle";

export interface ResourceOptions {
    label: string;
    key: number;
    visible?: boolean;
    nested?: string;
    nestedKey?: number;
}

interface MenuResource {
    nested: string;
    open: boolean;
    resources: ResourceDefinition<ResourceOptions & {
        selected: boolean;
    }>[];
}

const RESOURCE_ICONS: Record<string, React.ElementType> = {
    "users/staff": PeopleIcon,
    products: CategoryIcon,
    orders: ReceiptLongIcon,
    brands: LocalOfferIcon,
    facilities: BusinessIcon,
    businesses: GroupsIcon,
    mycompany: ApartmentIcon,
    companies: DomainIcon,
    adminstaff: ManageAccountsIcon
};

const ResourceIcon = ({ name }: { name: string }) => {
    const Icon = RESOURCE_ICONS[name.toLowerCase()];
    if (Icon) return <Icon />;
    return <CircleIcon sx={{ fontSize: "8px !important" }} />;
};

export const BizMenu = ({ ...props }: MenuProps) => {
    const [menuResources, setMenuResources] = React.useState([] as MenuResource[]);
    const location = useLocation();
    const resources: ResourceDefinitions<ResourceOptions> = useResourceDefinitions();

    React.useEffect(() => {
        const resourceKeys = order(Object.keys(resources).filter(key => resources[key].options && resources[key].options!.visible), {
            by: key => resources[key].options!.key
        });
        const newMenuResources: MenuResource[] = [];
        resourceKeys.forEach(key => {
            const resource: ResourceDefinition<ResourceOptions & {
                selected: boolean;
            }> = {
                ...resources[key],
                options: {
                    ...resources[key].options!,
                    selected: false
                }
            };
            const nested: string | undefined = resource.options!.nested;
            if (nested) {
                const menuResourceIndex = newMenuResources.findIndex(menuResource => menuResource.nested === nested);
                if (menuResourceIndex > -1) {
                    newMenuResources[menuResourceIndex].resources.push(resource);
                } else {
                    newMenuResources.push({
                        nested,
                        open: false,
                        resources: [resource]
                    });
                }
            } else {
                newMenuResources.push({
                    nested: "",
                    open: false,
                    resources: [resource]
                });
            }
        });
        newMenuResources.forEach(menuResource => {
            if (menuResource.nested) {
                menuResource.resources = order(menuResource.resources, {
                    by: x => x.options!.nestedKey || 0
                });
                menuResource.open = menuResource.resources.some(resource => isSelected(resource.name));
            }
        });
        setMenuResources(newMenuResources);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resources, location.pathname]);

    const isSelected = (resourceName: string) => {
        const locationPath = location.pathname.substring(1, location.pathname.length);
        const selected = locationPath.toLowerCase().includes(resourceName.toLowerCase());
        return selected;
    };

    const handleOpenNested = (nested: string) => {
        const newMenuResources: MenuResource[] = [];
        menuResources.forEach(menuResource => {
            if (menuResource.nested) {
                if (menuResource.nested === nested) {
                    menuResource.open = !menuResource.open;
                } else {
                    menuResource.open = false;
                }
            }
            newMenuResources.push(menuResource);
        });
        setMenuResources(newMenuResources);
    };

    const translate = useTranslate();

    return (
        <MenuContainer>
            <MenuListItemButton
                component={Link}
                to="/"
                selected={location.pathname === "/"}
            >
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                <MenuListItemText primary={translate("resources.dashboard.name", { smart_count: 1 })} />
            </MenuListItemButton>

            {menuResources.map((menuResource, i) => {
                if (!menuResource || menuResource.resources.length === 0) {
                    return <React.Fragment key={i} />;
                }
                if (menuResource.nested) {
                    return (
                        <React.Fragment key={i}>
                            <MenuGroupHeader onClick={() => handleOpenNested(menuResource.nested)}>
                                <MenuGroupLabel className="group-label">
                                    {translate(`resources.${menuResource.nested.toLowerCase()}.name`, { smart_count: 1 })}
                                </MenuGroupLabel>
                                {menuResource.open ? <ExpandLess /> : <ExpandMore />}
                            </MenuGroupHeader>
                            <Collapse key={i} in={menuResource.open} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {menuResource.resources.map((resource, j) => {
                                        const selected = isSelected(resource.name);
                                        return (
                                            <MenuListItemSubButton
                                                key={`nested-${j}`}
                                                component={Link}
                                                to={`/${resource.name}`}
                                                selected={selected}
                                            >
                                                <ListItemIcon><ResourceIcon name={resource.name} /></ListItemIcon>
                                                <MenuListItemSubText primary={translate(`resources.${resource.options!.label.toLowerCase()}.name`, { smart_count: 2 })} />
                                            </MenuListItemSubButton>
                                        );
                                    })}
                                </List>
                            </Collapse>
                        </React.Fragment>
                    );
                }
                const resource = menuResource.resources[0];
                const selected = isSelected(resource.name);
                return (
                    <MenuListItemButton
                        key={i}
                        component={Link}
                        to={`/${resource.name}`}
                        selected={selected}
                    >
                        <ListItemIcon><ResourceIcon name={resource.name} /></ListItemIcon>
                        <MenuListItemText primary={translate(`resources.${resource.options!.label.toLowerCase()}.name`, { smart_count: 2 })} />
                    </MenuListItemButton>
                );
            })}

            <FacilitySelector />
        </MenuContainer>
    );
};
