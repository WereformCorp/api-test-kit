import axios from "axios";

type TestCase = {
  ownerToken: string;
  attackerToken: string;
  postId: string;
  /** Base API host URL (no trailing slash), e.g. https://api.example.com */
  API_BASE_URL: string;
  /** Resource segment used for deletion route, e.g. posts */
  API_ENDPOINT: string;
};

/**
 * Runs authorization checks for delete permissions on a post.
 *
 * Request URL shape:
 * `${API_BASE_URL}/${API_ENDPOINT}/${postId}`
 *
 * @param cases - Authorization scenarios to validate.
 * @param cases[].ownerToken - Bearer token for the post owner (expected to succeed).
 * @param cases[].attackerToken - Bearer token for non-owner user (expected to fail).
 * @param cases[].postId - Post identifier appended at the end of the endpoint path.
 * @param cases[].API_BASE_URL - Base API origin such as `https://api.example.com`.
 * Keep this as host/root only; route parts belong in `API_ENDPOINT`.
 * @param cases[].API_ENDPOINT - Endpoint segment like `posts` or `v1/posts`.
 * This value is joined with the base URL and `postId`.
 */
const authorizationTest = (cases: TestCase[]) => {
  // Toggle AuthZ suite from env so it can be enabled/disabled per run.
  const run = process.env.RUN_AUTHZ === "true";

  // When disabled, register the suite as skipped instead of executing tests.
  (run ? describe : describe.skip)("Authorization Tests", () => {
    // Execute the same owner-vs-attacker checks for each provided scenario.
    cases.forEach(
      (
        { ownerToken, attackerToken, postId, API_BASE_URL, API_ENDPOINT },
        i,
      ) => {
        test(`Attacker cannot delete post [${i}]`, async () => {
          // Non-owner delete must fail with an authorization-related error.
          await expect(
            axios.delete(`${API_BASE_URL}/${API_ENDPOINT}/${postId}`, {
              headers: { Authorization: `Bearer ${attackerToken}` },
            }),
          ).rejects.toThrow();
        });

        test(`Owner can delete post [${i}]`, async () => {
          // Owner delete should succeed on the same post endpoint.
          const res = await axios.delete(
            `${API_BASE_URL}/${API_ENDPOINT}/${postId}`,
            {
              headers: { Authorization: `Bearer ${ownerToken}` },
            },
          );

          // Successful deletion is expected to return HTTP 200.
          expect(res.status).toBe(200);
        });
      },
    );
  });
};

export default authorizationTest;
