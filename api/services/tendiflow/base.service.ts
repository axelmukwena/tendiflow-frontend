import axios, { AxiosInstance } from "axios";

import { ENVIRONMENT_VARIABLES } from "@/utilities/constants/environment";

import { HeaderRequest } from "./types/general";

/**
 * Base configuration for API services
 */
interface BaseServiceConfig {
  baseURL?: string;
  timeout?: number;
  headers?: HeaderRequest;
  validateStatus?: (status: number) => boolean;
}

/**
 * Abstract base class for all API services
 */
export abstract class BaseApiService {
  protected api: AxiosInstance;
  protected readonly baseURL: string;

  constructor(config: BaseServiceConfig = {}) {
    this.baseURL =
      config.baseURL || ENVIRONMENT_VARIABLES.NEXT_PUBLIC_API_BASE_URL;

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        "Content-type": "application/json",
        ...config.headers,
      },
      validateStatus: config.validateStatus || ((): true => true),
    });

    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for request/response handling
   */
  protected setupInterceptors(): void {
    // Request interceptor for logging (development only)
    if (ENVIRONMENT_VARIABLES.NODE_ENV === "development") {
      this.api.interceptors.request.use(
        (config) => {
          console.debug(
            `API Request: ${config.method?.toUpperCase()} ${config.url}`,
          );
          return config;
        },
        (error) => {
          console.error("API Request Error:", error);
          return Promise.reject(error);
        },
      );
    }

    // Response interceptor for logging
    this.api.interceptors.response.use(
      (response) => {
        if (ENVIRONMENT_VARIABLES.NODE_ENV === "development") {
          console.debug(
            `API Response: ${response.status} ${response.config.url}`,
          );
        }
        return response;
      },
      (error) => {
        console.error("API Response Error:", error);
        return Promise.reject(error);
      },
    );
  }

  /**
   * Get the current base URL
   */
  public getBaseURL(): string {
    return this.baseURL;
  }
}
