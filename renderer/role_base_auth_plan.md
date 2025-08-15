Now I want to implement a role base Authenticate system.

@src/main/database/db.js read this file and flow the pattern to create a user table. with a default user, password and supperAdmin permission.
supperAdmin can access all the data and pages without any permission.
Also create others table to complete the role - permission base authentication.

@src/main/main.js @src/main/ipc/invoice.js read those files and flow the pattern.

- App Will be open with Login Screen
- If user enter valid credentials it will be redirect to the Dashboard (my current home page)
- If user enter invalid credentials it will be redirect to the Login Screen
- Then Supper admin can add new User, new role and new permission. Can assign role to user and permission to role.
- Then User will be able to access the data and pages based on their role permission.

For frontend flow the existing code pattern and UI style.