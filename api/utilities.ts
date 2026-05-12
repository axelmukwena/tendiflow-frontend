import { AxiosResponse } from "axios";
import { NextRequest } from "next/server";

import { ENVIRONMENT_VARIABLES } from "@/utilities/constants/environment";
import { HeaderKey } from "@/utilities/helpers/enums";

import {
  DataServiceResponse,
  ErrorApiResponse,
  HeaderRequest,
} from "./services/tendiflow/types/general";

/**
 * Check if the request was successful
 * @param {number} status The status code of the request.
 * @returns {boolean} If the request was successful.
 */
export const isRequestSuccess = (status: number): boolean =>
  status >= 200 && status < 300;

/**
 * Process the error response
 * @param {AxiosResponse<T | ErrorApiResponse>} res The response.
 * @param {string} defaultMessage The default message.
 * @returns {DataServiceResponse<T>} The data service response.
 */
export const processApiErrorResponse = <T>(
  res: AxiosResponse<T | ErrorApiResponse>,
  defaultMessage: string,
  oauth: boolean = false,
): DataServiceResponse<T> => {
  const { status: statuscode } = res;
  const { method } = res.config;
  const data = res.data as ErrorApiResponse;

  // Handle Oauth-specific error response
  if (oauth) {
    return {
      statuscode,
      success: false,
      message: data.description,
      data: null,
      total: 0,
    };
  }

  // Handle 404 not found only for GET requests
  if (statuscode === 404 && method?.toLowerCase() === "get") {
    return {
      statuscode,
      success: true,
      message: "Not found",
      data: null,
      total: 0,
    };
  }

  // Check if error contains both title and description, return description if present
  const message =
    data?.description ||
    data?.title ||
    `${defaultMessage}. Request Error, please contact support.`;

  return {
    statuscode,
    success: false,
    message,
    data: null,
    total: 0,
  };
};

export const getHeadersNextRequest = (req: NextRequest): HeaderRequest => {
  const headers: HeaderRequest = {};
  const forwardedFor = req.headers.get(HeaderKey.X_FORWARDED_FOR);
  const userAgent = req.headers.get(HeaderKey.USER_AGENT);
  const forwardedHost = req.headers.get(HeaderKey.X_FORWARDED_HOST);
  const forwardedPort = req.headers.get(HeaderKey.X_FORWARDED_PORT);
  const forwardedProto = req.headers.get(HeaderKey.X_FORWARDED_PROTO);
  if (forwardedFor) {
    if (forwardedFor === "::1") {
      headers[HeaderKey.X_FORWARDED_FOR] = "127.0.0.1";
    } else {
      headers[HeaderKey.X_FORWARDED_FOR] = forwardedFor;
    }
  }
  if (userAgent) {
    headers[HeaderKey.USER_AGENT] = userAgent;
  }
  if (forwardedHost) {
    headers[HeaderKey.X_FORWARDED_HOST] = forwardedHost;
  }
  if (forwardedPort) {
    headers[HeaderKey.X_FORWARDED_PORT] = forwardedPort;
  }
  if (forwardedProto) {
    headers[HeaderKey.X_FORWARDED_PROTO] = forwardedProto;
  }
  return headers;
};

export const getSeureNextRequestCookie = (): boolean =>
  ENVIRONMENT_VARIABLES.NODE_ENV !== "development" &&
  ENVIRONMENT_VARIABLES.NODE_ENV !== "test";

export const getDomainNextRequestCookie = (): string | undefined => undefined;
// ENVIRONMENT_VARIABLES.NODE_ENV === "development"
//   ? "localhost"
//   : ENVIRONMENT_VARIABLES.NEXT_PUBLIC_SITE_DOMAIN_NAME;
