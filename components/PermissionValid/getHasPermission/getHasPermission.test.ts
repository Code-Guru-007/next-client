import { Condition } from "../typings";
import getHasPermission from "./getHasPermission";

describe("getHasPermission", () => {
  it("should get has permission by conds and results1.", () => {
    const results = {
      hasModulePermission: true,
      hasMemberTargetPermission: true,
      hasVaildLoginIdPermission: true,
      hasOrgOwnerPermission: true,
    };

    const conds: Condition[] = [
      "MODULE",
      "OR",
      "TARGET",
      "OR",
      "MEMBER",
      "OR",
      "ORG_OWNER",
    ];
    expect(getHasPermission(conds, results)).toBeTruthy();

    const conds2: Condition[] = ["MODULE", "OR", "TARGET", "OR", "MEMBER"];
    expect(getHasPermission(conds2, results)).toBeTruthy();

    const conds3: Condition[] = ["MODULE", "OR", "TARGET"];
    expect(getHasPermission(conds3, results)).toBeTruthy();

    const conds4: Condition[] = ["MODULE"];
    expect(getHasPermission(conds4, results)).toBeTruthy();

    const conds5: Condition[] = [
      "MODULE",
      "AND",
      "TARGET",
      "AND",
      "MEMBER",
      "AND",
      "ORG_OWNER",
    ];
    expect(getHasPermission(conds5, results)).toBeTruthy();

    const conds6: Condition[] = ["MODULE", "AND", "TARGET", "AND", "MEMBER"];
    expect(getHasPermission(conds6, results)).toBeTruthy();

    const conds7: Condition[] = ["MODULE", "AND", "TARGET"];
    expect(getHasPermission(conds7, results)).toBeTruthy();
  });

  it("should get has permission by conds and results2.", () => {
    const results = {
      hasModulePermission: false,
      hasMemberTargetPermission: true,
      hasVaildLoginIdPermission: true,
      hasOrgOwnerPermission: true,
    };

    const conds: Condition[] = [
      "MODULE",
      "OR",
      "TARGET",
      "OR",
      "MEMBER",
      "OR",
      "ORG_OWNER",
    ];
    expect(getHasPermission(conds, results)).toBeTruthy();

    const conds2: Condition[] = ["MODULE", "OR", "TARGET", "OR", "MEMBER"];
    expect(getHasPermission(conds2, results)).toBeTruthy();

    const conds3: Condition[] = ["MODULE", "OR", "TARGET"];
    expect(getHasPermission(conds3, results)).toBeTruthy();

    const conds4: Condition[] = ["MODULE"];
    expect(getHasPermission(conds4, results)).toBeFalsy();

    const conds5: Condition[] = [
      "MODULE",
      "AND",
      "TARGET",
      "AND",
      "MEMBER",
      "AND",
      "ORG_OWNER",
    ];
    expect(getHasPermission(conds5, results)).toBeFalsy();

    const conds6: Condition[] = ["MODULE", "AND", "TARGET", "AND", "MEMBER"];
    expect(getHasPermission(conds6, results)).toBeFalsy();

    const conds7: Condition[] = ["MODULE", "AND", "TARGET"];
    expect(getHasPermission(conds7, results)).toBeFalsy();
  });

  it("should get has permission by conds and results3.", () => {
    const results = {
      hasModulePermission: true,
      hasMemberTargetPermission: false,
      hasVaildLoginIdPermission: true,
      hasOrgOwnerPermission: true,
    };

    const conds: Condition[] = [
      "MODULE",
      "AND",
      "TARGET",
      "OR",
      "MEMBER",
      "AND",
      "ORG_OWNER",
    ];
    expect(getHasPermission(conds, results)).toBeTruthy();

    const conds2: Condition[] = ["MODULE", "OR", "TARGET", "OR", "MEMBER"];
    expect(getHasPermission(conds2, results)).toBeTruthy();

    const conds3: Condition[] = ["MODULE", "AND", "MEMBER"];
    expect(getHasPermission(conds3, results)).toBeTruthy();

    const conds4: Condition[] = ["MODULE"];
    expect(getHasPermission(conds4, results)).toBeTruthy();

    const conds5: Condition[] = [
      "MODULE",
      "AND",
      "TARGET",
      "AND",
      "MEMBER",
      "AND",
      "ORG_OWNER",
    ];
    expect(getHasPermission(conds5, results)).toBeFalsy();

    const conds6: Condition[] = ["MODULE", "AND", "TARGET", "AND", "MEMBER"];
    expect(getHasPermission(conds6, results)).toBeFalsy();

    const conds7: Condition[] = ["MODULE", "AND", "TARGET"];
    expect(getHasPermission(conds7, results)).toBeFalsy();
  });

  it("should get has permission by conds and results4.", () => {
    const results = {
      hasModulePermission: true,
      hasMemberTargetPermission: true,
      hasVaildLoginIdPermission: false,
      hasOrgOwnerPermission: true,
    };

    const conds: Condition[] = [
      "MODULE",
      "AND",
      "TARGET",
      "OR",
      "MEMBER",
      "AND",
      "ORG_OWNER",
    ];
    expect(getHasPermission(conds, results)).toBeTruthy();

    const conds2: Condition[] = ["MODULE", "OR", "TARGET", "OR", "MEMBER"];
    expect(getHasPermission(conds2, results)).toBeTruthy();

    const conds3: Condition[] = ["MODULE", "AND", "MEMBER"];
    expect(getHasPermission(conds3, results)).toBeFalsy();

    const conds4: Condition[] = ["MODULE"];
    expect(getHasPermission(conds4, results)).toBeTruthy();

    const conds5: Condition[] = [
      "MODULE",
      "AND",
      "TARGET",
      "AND",
      "MEMBER",
      "AND",
      "ORG_OWNER",
    ];
    expect(getHasPermission(conds5, results)).toBeFalsy();

    const conds6: Condition[] = ["MODULE", "AND", "TARGET", "AND", "MEMBER"];
    expect(getHasPermission(conds6, results)).toBeFalsy();

    const conds7: Condition[] = ["MODULE", "AND", "TARGET"];
    expect(getHasPermission(conds7, results)).toBeTruthy();
  });

  it("should get has permission by conds and results5.", () => {
    const results = {
      hasModulePermission: true,
      hasMemberTargetPermission: true,
      hasVaildLoginIdPermission: true,
      hasOrgOwnerPermission: false,
    };

    const conds: Condition[] = [
      "MODULE",
      "OR",
      "TARGET",
      "OR",
      "MEMBER",
      "OR",
      "ORG_OWNER",
    ];
    expect(getHasPermission(conds, results)).toBeTruthy();

    const conds2: Condition[] = ["MODULE", "OR", "TARGET", "OR", "MEMBER"];
    expect(getHasPermission(conds2, results)).toBeTruthy();

    const conds3: Condition[] = ["MODULE", "AND", "ORG_OWNER"];
    expect(getHasPermission(conds3, results)).toBeFalsy();

    const conds4: Condition[] = ["MODULE"];
    expect(getHasPermission(conds4, results)).toBeTruthy();

    const conds5: Condition[] = [
      "MODULE",
      "AND",
      "TARGET",
      "AND",
      "MEMBER",
      "AND",
      "ORG_OWNER",
    ];
    expect(getHasPermission(conds5, results)).toBeFalsy();

    const conds6: Condition[] = ["MODULE", "AND", "TARGET", "AND", "MEMBER"];
    expect(getHasPermission(conds6, results)).toBeTruthy();

    const conds7: Condition[] = ["MODULE", "AND", "TARGET"];
    expect(getHasPermission(conds7, results)).toBeTruthy();
  });

  it("should get has permission by conds and results6.", () => {
    const results = {
      hasModulePermission: false,
      hasMemberTargetPermission: false,
      hasVaildLoginIdPermission: false,
      hasOrgOwnerPermission: false,
    };

    const conds: Condition[] = [
      "MODULE",
      "OR",
      "TARGET",
      "OR",
      "MEMBER",
      "OR",
      "ORG_OWNER",
    ];
    expect(getHasPermission(conds, results)).toBeFalsy();

    const conds2: Condition[] = ["MODULE", "OR", "TARGET", "OR", "MEMBER"];
    expect(getHasPermission(conds2, results)).toBeFalsy();

    const conds3: Condition[] = ["MODULE", "AND", "ORG_OWNER"];
    expect(getHasPermission(conds3, results)).toBeFalsy();

    const conds4: Condition[] = ["MODULE"];
    expect(getHasPermission(conds4, results)).toBeFalsy();

    const conds5: Condition[] = [
      "MODULE",
      "AND",
      "TARGET",
      "AND",
      "MEMBER",
      "AND",
      "ORG_OWNER",
    ];
    expect(getHasPermission(conds5, results)).toBeFalsy();

    const conds6: Condition[] = ["MODULE", "AND", "TARGET", "AND", "MEMBER"];
    expect(getHasPermission(conds6, results)).toBeFalsy();

    const conds7: Condition[] = ["MODULE", "AND", "TARGET"];
    expect(getHasPermission(conds7, results)).toBeFalsy();
  });

  it("should get has permission by conds and results7.", () => {
    const results = {
      hasModulePermission: false,
      hasMemberTargetPermission: false,
      hasVaildLoginIdPermission: true,
      hasOrgOwnerPermission: false,
    };

    const conds1: Condition[] = ["MODULE", "AND", "MEMBER"];
    expect(getHasPermission(conds1, results)).toBeFalsy();

    const conds2: Condition[] = ["MEMBER"];
    expect(getHasPermission(conds2, results)).toBeTruthy();

    const conds3: Condition[] = [
      "MODULE",
      "AND",
      "TARGET",
      "AND",
      "MEMBER",
      "AND",
      "ORG_OWNER",
    ];
    expect(getHasPermission(conds3, results)).toBeFalsy();

    const conds4: Condition[] = ["MODULE", "AND", "TARGET", "AND", "MEMBER"];
    expect(getHasPermission(conds4, results)).toBeFalsy();

    const conds5: Condition[] = ["MODULE", "AND", "TARGET"];
    expect(getHasPermission(conds5, results)).toBeFalsy();

    const conds6: Condition[] = ["MODULE", "OR", "MEMBER"];
    expect(getHasPermission(conds6, results)).toBeTruthy();
  });
});
