import replacePath from "./replacePath";

describe("replacePath", () => {
  it("should replace text with variables.", () => {
    const variables = { userId: "123", eventId: "345" };
    const text = "/me/crm/users/[userId]/events/[eventId]";
    expect(replacePath(text, variables)).toBe("/me/crm/users/123/events/345");
  });

  it("should not replace text when variables is empty.", () => {
    const variables = {};
    const text = "/me/crm/users/[userId]/events/[eventId]";
    expect(replacePath(text, variables)).toBe(text);
  });
});
