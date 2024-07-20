# create-next-app

This is the official TypeScript template for eGroup team.

To use this template, add `--use-npm --example "https://github.com/eGroupAI/frontend-templates/tree/main/egroup-starter"` when creating a new app.

For example:

```sh
npx create-next-app my-app --example "https://github.com/eGroupAI/frontend-templates/tree/main/egroup-starter"

# or

yarn create next-app my-app --example "https://github.com/eGroupAI/frontend-templates/tree/main/egroup-starter"
```

For more information, please refer to:

- [User Guide](https://nextjs.org/docs/getting-started) – How to develop apps bootstrapped with NextJs.

## Https develop server

```sh
yarn dev:https
```

## If you can't access npm package.

Please create github personal access token and run npm login script.

Step 1:
Create github personal access token.
Go to Settings -> Developer settings -> Personal access tokens -> Generate new token
Select scopes: repo, read:packages

<img width="690" alt="146155804-745c4227-a435-4ec1-94bb-cbf91c2abe0e" src="https://user-images.githubusercontent.com/35906352/146163774-177e9418-48ee-4c73-8e1a-73ea41dff6f6.png">

Step 2:
login with github access token.

```sh
npm login --scope=@eGroupAI --registry=https://npm.pkg.github.com
```

Pasting the token we create in step 1 into password field.

<img width="172" alt="146155636-93cc1de7-6f57-4004-a0ad-e36398e0eacf" src="https://user-images.githubusercontent.com/35906352/146163810-3d634300-27bf-4c48-a9aa-5546ffd3e1f4.png">
