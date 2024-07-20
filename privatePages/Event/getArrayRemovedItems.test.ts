import getArrayRemovedItems from "./getArrayRemovedItems";

describe("getArrayRemovedItems", () => {
  it("should get array removed items.", () => {
    const source = ["a", "b", "c"];
    const compared = ["a"];
    expect(getArrayRemovedItems(source, compared)).toEqual(["b", "c"]);
  });

  it("should get array removed items 2.", () => {
    const source = ["a", "b", "c"];
    const compared = ["d"];
    expect(getArrayRemovedItems(source, compared)).toEqual(["a", "b", "c"]);
  });
});
