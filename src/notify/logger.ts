export type CertEvent =
    | { type: "CHECK_OK"; targetId: string; host: string; port: number; daysRemaining: number; checkedAt: string }
    | { type: "EXPIRING"; targetId: string; host: string; port: number; daysRemaining: number; checkedAt: string }
    | { type: "EXPIRED"; targetId: string; host: string; port: number; daysRemaining: number; checkedAt: string }
    | { type: "CHECK_FAILED"; targetId: string; host: string; port: number; message: string; checkedAt: string };


export function logEvent(event: CertEvent) {
    console.log(JSON.stringify({ level: "info", ...event }));
}