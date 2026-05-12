import { NextResponse } from "next/server";

import {
  generateCsrfToken,
  setCsrfTokenCookie,
} from "@/utilities/helpers/csrf";

export const GET = async (): Promise<NextResponse> => {
  // Cookies have to be set on the response we actually return. The previous
  // version set the cookie on a throwaway `new NextResponse()` and then
  // returned a different `NextResponse.json(...)` — the Set-Cookie header
  // was silently discarded, so every fresh visitor failed every subsequent
  // CSRF check.
  const newCsrfToken = generateCsrfToken();
  const res = NextResponse.json(
    { success: true, message: "Successfully generated CSRF token" },
    { status: 200 },
  );
  setCsrfTokenCookie(res, newCsrfToken);
  return res;
};
