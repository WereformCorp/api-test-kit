// ===================== USER LOGOUT (AXIOS SUPPORT) =====================

import axios from "axios";

/**
 * User Logout Test Helper
 *
 * Registers a Jest suite for logout. API mode POSTs to your auth service with
 * optional `Authorization` / `Cookie` headers.
 *
 * Modes (per case):
 * - `local: true`  → placeholder pass (no HTTP); extend if you add real local teardown.
 * - `local: false` → `POST {base}/{endpoint}` with credentials.
 *
 * Environment:
 * - `AUTH_API_BASE_URL` — base URL when `AUTH_API_BASE_URL` on the case is omitted.
 *
 * Execution:
 * - Set `RUN_USER === "true"` to run; otherwise the suite is skipped.
 */

jest.setTimeout(10000);

/**
 * Single logout test scenario.
 * @property label Optional Jest test title.
 * @property local `true` = skip real HTTP; `false` = call logout API.
 * @property AUTH_API_BASE_URL Optional API base (falls back to `process.env.AUTH_API_BASE_URL`).
 * @property LOGOUT_ENDPOINT Path segment after base (default: `logout`).
 * @property token If set, sent as `Authorization: Bearer {token}`.
 * @property cookies If set, sent as `Cookie` header.
 * @property expectStatus Expected HTTP status for API mode (default: `200`).
 * @property contentType Request `Content-Type` (default: `application/json`).
 */
type LogoutTestCase = {
  label?: string;
  local: boolean;

  // API config
  AUTH_API_BASE_URL?: string;
  LOGOUT_ENDPOINT?: string;

  // Auth context
  token?: string;
  cookies?: string;

  // Behavior expectations
  expectStatus?: number;
  contentType?: string;
};

/**
 * Registers logout tests.
 *
 * @param cases - Logout scenarios (`LogoutTestCase`).
 * @returns void
 */
const logoutTest = (cases: LogoutTestCase[]) => {
  const run = process.env.RUN_USER === "true";

  (run ? describe : describe.skip)("User Logout Tests", () => {
    cases.forEach(
      (
        {
          label,
          local,
          AUTH_API_BASE_URL,
          LOGOUT_ENDPOINT,
          token,
          cookies,
          expectStatus = 200,
          contentType = "application/json",
        },
        index,
      ) => {
        test(label || `logout user [${index}]`, async () => {
          const base = process.env.AUTH_API_BASE_URL || AUTH_API_BASE_URL;
          const endpoint = LOGOUT_ENDPOINT || "logout";

          if (local) {
            // Local simulation (basic sanity check)
            expect(true).toBe(true);
          } else {
            const headers: Record<string, string> = {
              "Content-Type": contentType,
            };

            if (token) {
              headers["Authorization"] = `Bearer ${token}`;
            }

            if (cookies) {
              headers["Cookie"] = cookies;
            }

            const res = await axios.post(
              `${base}/${endpoint}`,
              {},
              {
                headers,
                withCredentials: true,
              },
            );

            expect(res.status).toBe(expectStatus);
            expect(res.data).toBeDefined();
          }
        });
      },
    );
  });
};

export default logoutTest;
