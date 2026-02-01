"use strict";
// Main entry point for LinkChecker CLI
// This file just re-exports the CLI
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkChecker = void 0;
var linkchecker_1 = require("./linkchecker");
Object.defineProperty(exports, "LinkChecker", { enumerable: true, get: function () { return linkchecker_1.LinkChecker; } });
// Run CLI if this file is executed directly
if (require.main === module) {
    require('./cli');
}
//# sourceMappingURL=index.js.map