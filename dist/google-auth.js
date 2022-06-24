"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.CLIENT_ID = void 0;
const google_auth_library_1 = require("google-auth-library");
exports.CLIENT_ID = "342224914071-disnoblsrvm8ka8fb9n69fucfjp2t9im.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
exports.client = new google_auth_library_1.OAuth2Client(exports.CLIENT_ID);
// verify().catch(console.error);
//# sourceMappingURL=google-auth.js.map