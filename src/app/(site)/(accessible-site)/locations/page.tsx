import { FC, Fragment } from "react";
import Title from "../../../_components/text/Title";
import SubTitle from "../../../_components/text/SubTitle";
import { Spacer } from "@nextui-org/spacer";
import LocationsContainer from "./components/LocationsContainer";

const LocationsPage: FC = () => {


    return (
        <Fragment>
            <Title>Locations</Title>
            <SubTitle>Manage the locations</SubTitle>
            <Spacer y={12} />
            <LocationsContainer />
        </Fragment>
    );
};

export default LocationsPage;