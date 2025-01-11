import { Redirect } from 'expo-router';
import React from 'react';

const MyProfilePage = () => {

    return (
        <Redirect href={"/myprofile/project"} />
    );
};

export default MyProfilePage;