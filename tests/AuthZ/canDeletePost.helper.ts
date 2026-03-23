import axios from "axios";

type TestCase = {
  ownerToken: string;
  attackerToken: string;
  postId: string;
  API_BASE_URL: string;
  API_ENDPOINT: string;
};

const authorizationTest = (cases: TestCase[]) => {
  const run = process.env.RUN_AUTHZ === "true";

  (run ? describe : describe.skip)("Authorization Tests", () => {
    cases.forEach(
      (
        { ownerToken, attackerToken, postId, API_BASE_URL, API_ENDPOINT },
        i,
      ) => {
        test(`Attacker cannot delete post [${i}]`, async () => {
          await expect(
            axios.delete(`${API_BASE_URL}/${API_ENDPOINT}/${postId}`, {
              headers: { Authorization: `Bearer ${attackerToken}` },
            }),
          ).rejects.toThrow();
        });

        test(`Owner can delete post [${i}]`, async () => {
          const res = await axios.delete(
            `${API_BASE_URL}/${API_ENDPOINT}/${postId}`,
            {
              headers: { Authorization: `Bearer ${ownerToken}` },
            },
          );

          expect(res.status).toBe(200);
        });
      },
    );
  });
};

export default authorizationTest;
