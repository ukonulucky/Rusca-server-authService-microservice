"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserIpFunc = void 0;
const axios_1 = __importDefault(require("axios"));
const timeFormater_1 = require("./timeFormater");
const getUserIpFunc = async (ip) => {
    try {
        console.log("ipInput", ip);
        const response = await axios_1.default.get(`http://ip-api.com/json/${ip}`);
        const ipdata = response.data;
        console.log("ipdata", ipdata);
        if (ipdata.status === "fail") {
            return {
                time: (0, timeFormater_1.timeFormaterFunc)(),
                ipAddress: "",
                location: {
                    country: "",
                    regionName: ""
                },
                status: ipdata.status
            };
        }
        return {
            time: (0, timeFormater_1.timeFormaterFunc)(),
            ipAddress: ipdata.query, // correct field for IP
            location: {
                country: ipdata.country,
                regionName: ipdata.regionName
            },
            status: ipdata.status
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getUserIpFunc = getUserIpFunc;
