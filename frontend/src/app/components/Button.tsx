export const Button = ({
    text,
    type,
    loading,
    children,
    className,
    onClick,
}: {
    text?: string;
    type: "submit" | "reset" | "button" | undefined;
    loading?: boolean;
    children?: React.ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) => {
    return (
        <button
            className={`bg-[var(--button-bg)] text-[var(--button-fg)] px-4 py-2 rounded ${className}`}
            type={type}
            disabled={loading}
            onClick={onClick}
        >
            {text}
            {children}
        </button>
    );
};
