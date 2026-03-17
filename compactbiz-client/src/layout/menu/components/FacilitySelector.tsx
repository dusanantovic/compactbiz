import { MiniFacility } from "../../../../models";
import { MenuItem, SelectChangeEvent } from "@mui/material";
import * as React from "react";
import { FacilitySelectorFormControl, FacilitySelectorSelect, FacilitySelectorOutlinedInput } from "../styledComponents";
import { ExpandMore } from "@mui/icons-material";

const FacilitySelectorComponent = () => {
    const [facilities, setFacilities] = React.useState<MiniFacility[]>(() =>
        JSON.parse(localStorage.getItem("facilities") || "[]")
    );
    const [selectedFacilitiId, setSelectedFacilityId] = React.useState<number | "">(() => {
        const facilitiesFromStorage: MiniFacility[] = JSON.parse(localStorage.getItem("facilities") || "[]");
        return facilitiesFromStorage.length > 0 ? facilitiesFromStorage[0].id : "";
    });

    React.useEffect(() => {
        const facilitiesFromStorage: MiniFacility[] = JSON.parse(localStorage.getItem("facilities") || "[]");
        setFacilities(facilitiesFromStorage);
        if (facilitiesFromStorage.length > 0) {
            setSelectedFacilityId(facilitiesFromStorage[0].id);
        }
    }, []);

    const handleFacilitySelector = (event: SelectChangeEvent<any>) => {
        const value = event.target.value;
        if (value) {
            setSelectedFacilityId(typeof value === "string" ? parseInt(value) : value);
        }
    };

    return (
        <FacilitySelectorFormControl>
            <FacilitySelectorSelect
                value={selectedFacilitiId}
                onChange={handleFacilitySelector}
                IconComponent={ExpandMore}
                input={<FacilitySelectorOutlinedInput />}
            >
                {facilities.map(f => (
                    <MenuItem
                        key={f.name}
                        value={f.id}
                        selected={f.id === selectedFacilitiId}
                    >
                        {f.name}
                    </MenuItem>
                ))}
            </FacilitySelectorSelect>
        </FacilitySelectorFormControl>
    );
};

export const FacilitySelector = FacilitySelectorComponent;