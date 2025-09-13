export const DashboardInfoCard = ({
    className,
    children,
    title,
}: {
    className?: string;
    children?: React.ReactNode;
    title: string;
}) => {
    return (
        <div className={`flex flex-col justify-center items-center gap-1 ${className}`}>
            <h2 className="text-lg font-bold mb-2">{title}</h2>
            {children}
        </div>
    );
};
