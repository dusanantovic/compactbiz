import * as React from "react";
import { SimpleForm, TextInput, Title, useGetOne, useTranslate, useUpdate } from "react-admin";
import { CardContent } from "@mui/material";
import { typed } from "src/util";
import { User } from "models";

export const ProfilePage = () => {
    return (
        <div>
            <Title title="Profile" />
            <CardContent>
                <UserForm/>
            </CardContent>
        </div>
    );
};
ProfilePage.path = "/profile";
const f = typed(User);
const UserForm = () => {
    const translate = useTranslate();
    const { data: user, isPending: isPendingUser } = useGetOne("users", { id: "me" });
    const [update, { isPending }] = useUpdate();

    const save = (data: any) => update("users", { id: "me", data, previousData: user });

    if (isPendingUser || !user) return <>Loading...</>;
    return (
        <SimpleForm defaultValues={user} onSubmit={save}>
            <TextInput source={f(x => x.firstName)} label={translate(`resources.misc.firstName`, { smart_count: 1, })} />
        </SimpleForm>
    );
};