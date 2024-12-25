// TODO import is not working yet...
import { cleanOptions } from "../../views/settings/common";

describe("Settings", () => {
  test("cleanOptions", () => {
    const target = cleanOptions({
      ignored: "yes",
      rootPaddingTop: "11"
    });
    expect(target).toBe({});
  });
});
