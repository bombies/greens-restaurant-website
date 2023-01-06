type Props = {
    className?: string;
    title: string;
    description?: string;
    component: JSX.Element;
};

const DashboardRow = (props: Props) => {
    return (
        <div className={`flex mb-6 ${props.className || ''}`}>
            <div>
                <p className="dark:text-white font-medium text-xl pointer-events-none">
                    {props.title}
                </p>
                {props.description && (
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-sm pointer-events-none">
                        {props.description}
                    </p>
                )}
            </div>
            {props.component}
        </div>
    );
};

export default DashboardRow;
