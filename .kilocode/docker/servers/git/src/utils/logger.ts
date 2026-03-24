import * as fs from "fs";
import * as path from "path";

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

class StructuredLogger implements Logger {
    private logDir: string;
    private serviceName: string;

    constructor(serviceName: string = "mcp-git") {
        this.serviceName = serviceName;
        this.logDir = process.env["LOG_DIR"] || "/app/logs";
        this.ensureLogDirectory();
    }

    private ensureLogDirectory(): void {
        try {
            if (!fs.existsSync(this.logDir)) {
                fs.mkdirSync(this.logDir, { recursive: true });
            }
        } catch (error) {
            console.error("Failed to create log directory:", error);
        }
    }

    private formatLogEntry(
        level: LogEntry["level"],
        message: string,
        args?: any[],
        error?: any,
    ): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            service: this.serviceName,
            args: args?.length ? args : [],
            error: error
                ? {
                      message: error.message,
                      stack: error.stack,
                      name: error.name,
                  }
                : undefined,
        };
    }

    private writeToFile(entry: LogEntry): void {
        try {
            const logFile = path.join(this.logDir, `${this.serviceName}.log`);
            const logLine = JSON.stringify(entry) + "\n";
            fs.appendFileSync(logFile, logLine);
        } catch (error) {
            console.error("Failed to write to log file:", error);
        }
    }

    private log(
        level: LogEntry["level"],
        message: string,
        args?: any[],
        error?: any,
    ): void {
        const entry = this.formatLogEntry(level, message, args, error);

        // Console logging to stderr (stdout is reserved for MCP protocol)
        const consoleMessage = `[${level}] ${message}`;
        switch (level) {
            case "INFO":
                console.error(consoleMessage, ...(args || []));
                break;
            case "ERROR":
                console.error(consoleMessage, error);
                break;
            case "WARN":
                console.error(consoleMessage, ...(args || []));
                break;
            case "DEBUG":
                if (process.env["DEBUG"]) {
                    console.error(consoleMessage, ...(args || []));
                }
                break;
        }

        // File logging
        this.writeToFile(entry);
    }

    info(message: string, ...args: any[]): void {
        this.log("INFO", message, args);
    }

    error(message: string, error?: any): void {
        this.log("ERROR", message, undefined, error);
    }

    warn(message: string, ...args: any[]): void {
        this.log("WARN", message, args);
    }

    debug(message: string, ...args: any[]): void {
        this.log("DEBUG", message, args);
    }
}

export const logger: Logger = new StructuredLogger();
