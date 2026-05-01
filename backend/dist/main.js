"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const core_1 = require("@nestjs/core");
const app_module_js_1 = require("./app.module.js");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_js_1.AppModule);
    app.enableCors();
    const frontendPath = (0, node_path_1.resolve)(process.cwd(), "../frontend");
    if ((0, node_fs_1.existsSync)(frontendPath)) {
        app.useStaticAssets(frontendPath);
    }
    const port = Number(process.env.PORT) || 3000;
    await app.listen(port);
}
void bootstrap();
//# sourceMappingURL=main.js.map