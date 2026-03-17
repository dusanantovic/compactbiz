import * as React from "react";
import { AutocompleteInput, AutocompleteInputProps, useFieldValue } from "react-admin";
import { http } from "../http";
import { buildHttpUrl } from "../httpDataProvider";

interface AsyncSelectInputProps extends AutocompleteInputProps {
    any?: any;
}

export const AsyncSelectInput = ({ source, resource, filterToQuery, optionValue, optionText, ...rest }: AsyncSelectInputProps) => {
    const [choices, setChoices] = React.useState([] as Record<string, any>[]);
    const [loading, setLoading] = React.useState(false);
    const [initialized, setInitialized] = React.useState(false);
    const [timerId, setTimerId] = React.useState(null as NodeJS.Timeout | null);
    const sourceValue = useFieldValue({ source: source?.endsWith("Id") ? source.substring(0, source.length - 2) : (source ?? "") });

    React.useEffect(() => {
        if (!initialized) {
            if (source?.endsWith("Id")) {
                if (sourceValue) {
                    setChoices([{
                        [optionValue ?? "id"]: sourceValue[optionValue ?? "id"],
                        [(optionText ?? "name") as string]: sourceValue[(optionText ?? "name") as string]
                    }]);
                    setInitialized(true);
                }
            } else {
                setInitialized(true);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sourceValue]);

    const fetchChoices = async (value?: string) => {
        if (!resource || loading) {
            return;
        }
        setLoading(true);
        try {
            let queryParams: Record<string, any> | undefined = undefined;
            if (value) {
                queryParams = { q: value };
            }
            if (filterToQuery) {
                if (!queryParams) {
                    queryParams = {};
                }
                queryParams = {
                    ...queryParams,
                    ...filterToQuery(value ?? "")
                };
            }
            const response = await http(buildHttpUrl(resource, queryParams));
            const result = response.json as any[];
            if (result) {
               setChoices(result);
            } else {
                setChoices([]);
            }
        } catch (err: any) {
            console.log("Async select error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = async (value: string) => {
        value = (value || "").trim();
        if (typeof timerId === "number") {
            clearTimeout(timerId);
        }
        const newTimerId = setTimeout(() => {
            void fetchChoices(value);
        }, 300);
        setTimerId(newTimerId);
    };

    return (
        <AutocompleteInput
            {...rest}
            source={source}
            resource={resource}
            choices={choices}
            optionText={optionText}
            optionValue={optionValue}
            onFocus={() => void fetchChoices()}
            onInputChange={(event, value) => handleChange(value)}
            loading={loading}
        />
    );
};