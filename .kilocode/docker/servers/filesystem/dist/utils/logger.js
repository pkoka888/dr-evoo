"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class StructuredLogger {
    logDir;
    serviceName;
    constructor(serviceName = "mcp-filesystem") {
        this.serviceName = serviceName;
        this.logDir = process.env["LOG_DIR"] || "/app/logs";
        this.ensureLogDirectory();
    }
    ensureLogDirectory() {
        try {
            if (!fs.existsSync(this.logDir)) {
                fs.mkdirSync(this.logDir, { recursive: true });
            }
        }
        catch (error) {
            console.error("Failed to create log directory:", error);
        }
    }
    formatLogEntry(level, message, args, error) {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            service: this.serviceName,
            args: args?.length ? args : undefined,
            error: error
                ? {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                }
                : undefined,
        };
    }
    writeToFile(entry) {
        try {
            const logFile = path.join(this.logDir, `${this.serviceName}.log`);
            const logLine = JSON.stringify(entry) + "\n";
            fs.appendFileSync(logFile, logLine);
        }
        catch (error) {
            console.error("Failed to write to log file:", error);
        }
    }
    log(level, message, args, error) {
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
    info(message, ...args) {
        this.log("INFO", message, args);
    }
    error(message, error) {
        this.log("ERROR", message, undefined, error);
    }
    warn(message, ...args) {
        this.log("WARN", message, args);
    }
    debug(message, ...args) {
        this.log("DEBUG", message, args);
    }
}
exports.logger = new StructuredLogger();
//# sourceMappingURL=logger.js.map