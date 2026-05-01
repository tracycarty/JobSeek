"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
function loadEnv(path = ".env") {
    const envPath = (0, node_path_1.resolve)(process.cwd(), path);
    if (!(0, node_fs_1.existsSync)(envPath)) {
        return;
    }
    const lines = (0, node_fs_1.readFileSync)(envPath, "utf8").split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
            continue;
        }
        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex === -1) {
            continue;
        }
        const key = trimmed.slice(0, separatorIndex).trim();
        const value = trimmed.slice(separatorIndex + 1).trim();
        if (key && process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}
//# sourceMappingURL=load-env.js.map