import { ENVIRONMENT_VARIABLES } from "@/utilities/constants/environment";

import { BaseApiService } from "./base.service";
import { HeaderRequest } from "./types/general";

/**
 * API service for endpoints that don't require user authentication.
 * Forwards the server-side API_KEY in the X-API-Key header so the backend can
 * gate public/guest endpoints to requests originating from our Next.js layer.
 */
export class WeaverNoTokenApiService extends BaseApiService {
  constructor(headers?: HeaderRequest) {
    super({
      headers: {
        "x-api-key": ENVIRONMENT_VARIABLES.API_KEY,
        ...headers,
      },
    });
  }
}
