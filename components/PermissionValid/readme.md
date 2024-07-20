# 基礎用法 - Basic Use

## 1.Pass if any module exists (Default : is `OR` of modules)

任一模組有就通過(模組預設為 `OR` )

```jsx
<PermissionValid
  modulePermissions={["UPDATE_ALL", "DELETE", "COMMENT", "AUDIT"]}
>
  ...
</PermissionValid>
```

## 2. All of module need exists (AND of modules)

驗證擁有所有模組 (模組間為 `AND`)

```jsx
<PermissionValid
  modulePermissions={["UPDATE_ALL", "DELETE", "COMMENT", "AUDIT"]}
  modulePermissionsValidWay="AND"
>
```

## 3. Verify has Module Permissions or Target Permissions

驗證有模組權限 或 Target 權限

- Example OR
  - module permission : UPDATE_ALL
  - Article target permission : UPDATE

```jsx
<PermissionValid
  modulePermissions={["UPDATE_ALL"]}
  memberAuth={{
    memberAuthPermissions: article?.organizationMemberTargetAuth ?.organizationMemberTargetAuthPermission,
    validPermissions: ["UPDATE"]
  }}
>
```

## 4. Verify is data creator

驗證是否為資料創建者

```jsx
<PermissionValid
  vaildLoginId={article?.creator?.loginId}
>
```

## 5. Verify is organization creator

```jsx
<PermissionValid
  shouldBeOrgOwner
>
```

# 進階用法 - Advanced use

## PermissionValid - 4 different permissions

- Module permission
- Target permission
- Member permission
- Org owner permission

## Conditional example

### 1. Default - Pass if any conditions pass

- 預設 - 只要其中之一通過

```
hasPermission = hasMemberAuthPermission || hasMemberTargetPermission || hasVaildLoginIdPermission || hasOrgOwnerPermission
```

- Example

```
["MODULE", "OR", "TARGET", "OR", "MEMBER", "OR", "ORG_OWNER"]
```

- Example - one of three pass

```jsx
<PermissionValid
  modulePermissions={["UPDATE_ALL"]}
  memberAuth={{
    memberAuthPermissions: article?.organizationMemberTargetAuth ?.organizationMemberTargetAuthPermission,
    validPermissions: ["UPDATE"]
  }}
  conditions={["MODULE", "OR", "TARGET", "OR", "MEMBER"]}
>
```

### 2. All of conditions need pass

- Example 4 conditions pass

```jsx
<PermissionValid
  modulePermissions={["UPDATE_ALL"]}
  memberAuth={{
    memberAuthPermissions: article?.organizationMemberTargetAuth ?.organizationMemberTargetAuthPermission,
    validPermissions: ["UPDATE"]
  }}
  conditions={["MODULE", "AND", "TARGET", "AND", "MEMBER", "AND", "ORG_OWNER"]}
>
```

- Example 2 conditions pass

```jsx
<PermissionValid
  modulePermissions={["UPDATE_ALL"]}
  memberAuth={{
    memberAuthPermissions: article?.organizationMemberTargetAuth ?.organizationMemberTargetAuthPermission,
    validPermissions: ["UPDATE"]
  }}
  conditions={["MODULE", "AND", "TARGET"]}
>
```

- Example 1 conditions pass

```jsx
<PermissionValid
  modulePermissions={["UPDATE_ALL"]}
  conditions={["MODULE"]}
>
```

## PermissionValidGroup

- One of the conditions pass
  假如條件有多個組合但只會符合其中一種組和則可以使用 PermissionValidGroup

- Example
  - The above is composed of two condition groups, which means that if the first group or the second group is met, it will be displayed, and if both condition groups are met at the same time, the same object will be displayed repeatedly, which requires special care in setting.
  - 上面由兩個條件群組所組成，代表如果符合第一個群組或第二個群組皆會顯示，若同時符合兩個條件群組則會重複顯示同一個物件，需要特別小心設定。

```jsx
<PermissionValidGroup
  schema={[
    {
      shouldBeOrgOwner: true,
      modulePermissions: ["UPDATE_ALL"],
    },
    {
      modulePermissions: ["UPDATE"],
      vaildLoginId: data?.updater?.loginId,
      conditions: ["MODULE", "AND", "MEMBER"],
    },
  ]}
>
```

# Hook

```jsx
import usePermissionValid from "components/PermissionValid/usePermissionValid";

const hasTagPermission = usePermissionValid({
  modulePermissions: [],
  ...
})

...
```
