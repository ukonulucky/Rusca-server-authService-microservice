
import axios from "axios"
import { timeFormaterFunc } from "./timeFormater";
import { IpAddressInfo } from "../types/appTypes";


export const getUserIpFunc = async (ip: string): Promise<IpAddressInfo> => {
  try {
    console.log("ipInput", ip);
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    const ipdata = response.data;

    console.log("ipdata", ipdata);

    if (ipdata.status === "fail") {
      return {
        time: timeFormaterFunc(),
        ipAddress: "",
        location: {
          country: "",
          regionName: ""
        },
        status: ipdata.status
      };
    }

    return {
      time: timeFormaterFunc(),
      ipAddress: ipdata.query, // correct field for IP
      location: {
        country: ipdata.country,
        regionName: ipdata.regionName
      },
      status: ipdata.status
    };

  } catch (error: any) {
    throw new Error(error.message);
  }
};
