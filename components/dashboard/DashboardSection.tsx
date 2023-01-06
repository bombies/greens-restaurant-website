import React from "react";

interface Props extends React.PropsWithChildren {
    title?: string;
    className?: string;
}

const DashboardSection = (props: Props) => {
    return (
        <div className={`rounded-xl border-green-400 border-[1px] border-solid w-3/4 laptop:w-[95%] border-opacity-20 shadow-md p-6 phone:p-2 mb-12 ${props.className || ''}`}>
            {props.title && (
                <h3 className="text-2xl font-bold uppercase tracking-wider text-green-400 mb-6 pointer-events-none drop-shadow-lg">
                    {props.title}
                </h3>
            )}
            {props.children}
        </div>
    );
};

export default DashboardSection;