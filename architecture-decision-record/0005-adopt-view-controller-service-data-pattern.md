# 5. Adopt View - Controller - Service - Data Pattern

Date: 2024-02-14

## Status

✅ Pending

## Context

For numerous historical reasons, the current codebase currently adopts a variety of design patterns to implement the various pages/tabs.

It would be better to standardise a common approach across all pages for the following reasons:

1. Clear seperation of concerns - organise the code used to display each page into clear layers with clear resposibilities and interactions and enforce through interfaces.
2. Consistency - if all pages are built the same way then the cognitive load on developers will be lower.
3. Higher quality - individual layers can be tested in isolation. We can also test more selectivly/intelligently.
4. Adding/changing features will be quicker - points above should make it quicker/easier to make changes.
5. Improved code base and adoption of pattern will make onboarding new team members easier. Also if other teams need to make changes to our codebase.

---

## View - Controller - Service - Data

Each layer has the following responsibilities:

1. View - responsible for displaying data and interacting with the user.
2. Controller - calls services and *converts* data to the required form for the view; *validates* input data before handing to services; uses 'application' DTOs when interacting with services layer
3. Services - intermediate layer that can bring multiple data calls together and present amalgamated data to the controller; will convert between Data DTOs and 'application' DTOs; common functionality e.g. audting
4. Data - calls external services to obtain/storeinformaton; defines strong contract with services layer regarding data structure

Additional points:

1. Defining contracts between layers is key
2. Whether we convert data at every level is TBD - is it overkill, are the benefits of elminating accidental coupling worth it?
3. Jon pointed out that some data handling complexities we have in the UI could be 'solved' in the data layer
4. This should help us standardise how we display a page or a field if a particular data source is not available


## Decision

...

## Consequences

This will drive consistency and help make it easier to change the codebase and add features in the future. 

New team members in the future would benefit in particular. 

And if other teams have to make more changes we will all benefit too.

