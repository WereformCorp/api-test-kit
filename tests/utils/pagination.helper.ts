// ===================== QUERY TEST =====================

import axios from "axios";

/**
 * Registers query-focused tests for pagination and filtering behavior.
 *
 * The suite runs only when `RUN_QUERY=true`; otherwise it is skipped.
 * It verifies that the API returns a paginated user list and that filtering by
 * `role=admin` returns only matching records.
 *
 * @param API_BASE_URL Base URL for the target API.
 */
const queryTest = (API_BASE_URL: string) => {
  const run = process.env.RUN_QUERY === "true";

  (run ? describe : describe.skip)("Query Tests", () => {
    /**
     * Checks that server-side pagination returns at most `limit` items.
     */
    test("pagination works correctly", async () => {
      const res = await axios.get(`${API_BASE_URL}/users?page=1&limit=2`);

      expect(res.status).toBe(200);
      expect(res.data.length).toBeLessThanOrEqual(2);
    });

    /**
     * Checks that role filtering returns only users with the requested role.
     */
    test("filter works correctly", async () => {
      const res = await axios.get(`${API_BASE_URL}/users?role=admin`);

      expect(res.status).toBe(200);
      res.data.forEach((u: any) => {
        expect(u.role).toBe("admin");
      });
    });
  });
};

export default queryTest;
