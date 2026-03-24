export interface LogEntry {
    timestamp: string;
    level: "INFO" | "ERROR" | "WARN" | "DEBUG";
    message: string;
    service: string;
    args?: any[];
    error?: any;
}
export interface Logger {
    info(message: string, ...args: any[]): void;
    error(message: string, error?: any): void;
    warn(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
}
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map