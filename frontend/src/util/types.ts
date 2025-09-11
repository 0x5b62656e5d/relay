export default interface StandardResponse {
    success: boolean;
    data: Record<string, unknown> | null;
    message: string | null;
    error: string | null;
}
