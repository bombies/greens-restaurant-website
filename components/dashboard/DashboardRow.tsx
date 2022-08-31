type Props = {
    title: string;
    description?: string;
    component: JSX.Element;
    gap?: number;
};

const DashboardRow = (props: Props) => {
    return (
        <div className="flex mb-6" style={{ gap: `${props.gap || 13}rem` }}>
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
