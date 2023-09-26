import SpecificLocationContext from "./components/SpecificLocationContext";

type Context = {
    params: {
        location: string
    }
}

const SpecificLocationPage = ({ params: { location } }: Context) => {
    return (
        <SpecificLocationContext locationName={location} />
    );
};

export default SpecificLocationPage;