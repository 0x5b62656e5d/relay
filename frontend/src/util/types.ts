export default interface StandardResponse {
    success: boolean;
    data: Record<string, unknown> | null;
    message: string | null;
    error: string | null;
}

export interface UrlData {
    id: string;
    user_id: string;
    url: string;
    created_at: Date;
    clicks: number;
    comments: string | null;
    last_clicked: Date;
}

export interface UrlClick {
    id: string;
    url_id: string;
    clicked_at: Date;
    user_agent: string;
    ip_address: string;
}

export interface StatusMessage {
    success: boolean | null;
    message: string | null;
}
