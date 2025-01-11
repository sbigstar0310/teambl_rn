import React from 'react';
import {Text} from "react-native";

const NewProfileHeader = (props: any) => {

    const {
        userId : string,
        isMyProfile : boolean
    } = props;

    const fetchUserInfo = async () => {
        // TODO
    }

    return (
        <>
            <Text>{"Header : TODO"}</Text>
        </>
    );
};

export default NewProfileHeader;