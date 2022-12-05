interface Props extends React.PropsWithChildren {
    className?: string;
    title?: string;
}

const GenericWidget = (props: Props) => {
    return (
        <div
            className={`transition-faster w-5/6 h-72 shadow-lg border-green-400/20 border-[1px] rounded-xl p-6 ${
                props.className || ""
            }`}
        >
            {props.title && (
                <div>
                    <h3 className="font-bold text-2xl text-green-500 dark:text-white pointer-events-none">
                        {props.title}
                    </h3>
                    <hr className="transition-medium dark:opacity-10 mb-3" />
                </div>
            )}
            {props.children}
        </div>
    );
};

export default GenericWidget;
