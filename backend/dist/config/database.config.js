"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = getDatabaseConfig;
const job_entity_js_1 = require("../jobs/job.entity.js");
function getDatabaseConfig() {
    return {
        type: "mysql",
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 3306,
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_DATABASE || "jobseek",
        entities: [job_entity_js_1.Job],
        synchronize: process.env.DB_SYNCHRONIZE !== "false",
    };
}
//# sourceMappingURL=database.config.js.map