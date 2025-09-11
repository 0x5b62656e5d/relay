export const Button = ({
    text,
    type,
    loading,
}: {
    text: string;
    type: "submit" | "reset" | "button" | undefined;
    loading?: boolean;
}) => {
    return (
        <button
            className="bg-[var(--button-bg)] text-[var(--button-fg)] px-4 py-2 rounded"
            type={type}
            disabled={loading}
        >
            {text}
        </button>
    );
};
