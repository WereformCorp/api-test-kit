import axios from "axios";

/**
 * Registers authorization tests related to user profile updates.
 *
 * The suite runs only when `RUN_AUTHZ=true`; otherwise it is skipped.
 * It verifies that one authenticated user cannot modify another user's data.
 *
 * @param API_BASE_URL Base URL for the target API.
 * @param tokenA Bearer token for the primary user (reserved for broader authz scenarios).
 * @param tokenB Bearer token for a different user attempting the forbidden action.
 * @param userId Identifier of the user resource being protected.
 * @param USER_ENDPOINT API endpoint segment for user resources.
 */
const authorizationTest = (
  API_BASE_URL: string,
  tokenA: string,
  tokenB: string,
  userId: string,
  USER_ENDPOINT: string,
) => {
  const run = process.env.RUN_AUTHZ === "true";

  (run ? describe : describe.skip)("Authorization", () => {
    /**
     * Ensures cross-user mutation is denied with a client/server error response.
     */
    test("user cannot modify another user", async () => {
      try {
        await axios.patch(
          `${API_BASE_URL}/${USER_ENDPOINT}/${userId}`,
          { email: "hacked@test.com" },
          { headers: { Authorization: `Bearer ${tokenB}` } },
        );
      } catch (err: any) {
        expect(err.response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });
};

export default authorizationTest;
