export const formatDate = (date: Date): string => {
    return new Date(date)
        .toLocaleString(navigator.language, {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        })
        .replace(",", "");
};
