import axios from "axios";

type TestCase = {
  payload: any;
  expectedRejectionStatus: number;
  expectedResponseStatus: number;
  /** Base API host URL (no trailing slash), e.g. https://api.example.com */
  API_BASE_URL: string;
  /** Optional resource segment to post to, e.g. posts or v1/posts */
  API_ENDPOINT?: string;
};

/**
 * Runs validation-focused POST request tests using provided payload scenarios.
 *
 * Request URL shape:
 * `${API_BASE_URL}/${API_ENDPOINT}`
 *
 * @param cases - Validation scenarios to execute.
 * @param cases[].payload - Request body sent to the API.
 * @param cases[].expectedRejectionStatus - Expected HTTP status when payload is invalid.
 * @param cases[].expectedResponseStatus - Expected HTTP status when payload is valid.
 * @param cases[].API_BASE_URL - Base API origin such as `https://api.example.com`.
 * Keep this as host/root only; route parts belong in `API_ENDPOINT`.
 * @param cases[].API_ENDPOINT - Endpoint segment like `posts` or `v1/posts`.
 * Combined with base URL to build the target POST route.
 */
const inputValidationTest = (cases: TestCase[]) => {
  // Toggle validation suite from env so it can be enabled/disabled per run.
  const run = process.env.RUN_VALIDATION === "true";

  // When disabled, register the suite as skipped instead of executing tests.
  (run ? describe : describe.skip)("Validation Tests", () => {
    // Run the same validation checks for each supplied scenario.
    cases.forEach(
      (
        {
          payload,
          expectedRejectionStatus,
          expectedResponseStatus,
          API_BASE_URL,
          API_ENDPOINT,
        },
        i,
      ) => {
        test(`invalid payload rejected [${i}]`, async () => {
          // Invalid payload requests should return the configured rejection status.
          try {
            await axios.post(`${API_BASE_URL}/${API_ENDPOINT}`, payload);
          } catch (err: any) {
            expect(err.response.status).toBe(expectedRejectionStatus);
          }
        });

        test(`Valid payload accepted [${i}]`, async () => {
          // Valid payload requests should succeed with the expected status code.
          const res = await axios.post(
            `${API_BASE_URL}/${API_ENDPOINT}`,
            payload,
          );
          expect(res.status).toBe(expectedResponseStatus);
        });
      },
    );
  });
};

export default inputValidationTest;
