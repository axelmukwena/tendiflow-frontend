import { BaseApiService } from "./base.service";
import { HeaderRequest } from "./types/general";

/**
 * API service that requires authentication token
 */
export class TendiflowApiService extends BaseApiService {
  private readonly token: string;
  constructor(token: string, headers?: HeaderRequest) {
    if (!token) {
      throw new Error("Authentication token is required");
    }
    super({
      headers: {
        authorization: `Bearer ${token}`,
        ...headers,
      },
    });
    this.token = token;
  }

  /**
   * Get the current authentication token
   */
  protected getToken(): string {
    return this.token;
  }

  /**
   * Check if the current token is valid (basic format check)
   */
  protected isTokenValid(): boolean {
    return !!this.token && this.token.length > 0;
  }
}
