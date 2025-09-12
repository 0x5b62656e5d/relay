export default interface StandardResponse {
    success: boolean;
    data: Record<string, unknown> | null;
    message: string | null;
    error: string | null;
}

export interface Url {
    id: string;
    userId: string;
    url: string;
    createdAt: Date;
    clicks: number;
    comments: string | null;
    lastClicked: Date;
}

export interface StatusMessage {
    success: boolean | null;
    message: string | null;
}
