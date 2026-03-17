import { useState, useEffect } from "react";

const padding = 68;

export const useListWrapperWidth = () => {
    const [listWrapperWidth, setListWrapperWidth] = useState(window.innerWidth - padding);

    useEffect(() => {
        window.addEventListener("resize", listWrapperListener);
        return () => {
            window.removeEventListener("resize", listWrapperListener);
        };
    }, []);

    const listWrapperListener = () => {
        setListWrapperWidth(window.innerWidth - padding);
    };

    return listWrapperWidth;
};