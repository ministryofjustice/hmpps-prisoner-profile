# 2. Prefer `interface` Over `type`

Date: 2023-02-15

## Status

✅ Accepted

## Context

The Typescript handbook recommends using `interface` over `type` (type alias), mainly due to better error messages

## Decision

We will prefer to use `interface` unless there is a good reason to use `type` in a specific situation.

## Consequences

This should ensure consistency across the codebase and make it easier to debug certain errors.


