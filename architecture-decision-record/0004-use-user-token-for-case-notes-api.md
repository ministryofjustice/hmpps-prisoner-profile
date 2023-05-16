# 3. Use `async`/`await` pattern over `Promise.then`

Date: 2023-05-15

## Status

✅ Accepted

## Context

Normally we use the `clientToken` to access API endpoints and this is configured with all the roles necessary to use the application.

However, for Case Notes, this API uses some logic to send back sensitive case notes based on role. Giving the client credentials this 
role would mean *all* users get sensitive case notes but the UI would need to filter them out if the user didn't have the role.
This would cause issues with pagination, sorting, etc and also be a potential security risk.

## Decision

We will use the user token itself for calls to Case Notes API endpoints.

## Consequences

This will be safer and avoid causing issues with lists.


