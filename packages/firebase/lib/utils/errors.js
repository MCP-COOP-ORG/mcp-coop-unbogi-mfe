"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFirebaseError = void 0;
const isFirebaseError = (error) => {
    return typeof error === "object" && error !== null && "code" in error && "message" in error;
};
exports.isFirebaseError = isFirebaseError;
//# sourceMappingURL=errors.js.map