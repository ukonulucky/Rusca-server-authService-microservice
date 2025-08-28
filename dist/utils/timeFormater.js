"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeFormaterFunc = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const timeFormaterFunc = () => {
    return moment_timezone_1.default.tz(Date.now(), "Europe/London").format("MMMM Do, h:mm A"); // e.g., "May 19th, 2:07 PM"
};
exports.timeFormaterFunc = timeFormaterFunc;
