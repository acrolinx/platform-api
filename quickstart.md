# Quick Start Tutorial

1. Load the [collection file](Acrolinx-API.postman_collection.json) in [POSTMAN](https://www.getpostman.com/).
2. Create a new [environment](https://learning.postman.com/docs/sending-requests/managing-environments/) and set an initial value for variables.
3. Happy API requests.  
  

## Variables

| Name                     | Description                                                                          | Example value                                      |
| ------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| ACROLINX_URL             | Your Acrolinx instance URL. Used in request paths.                                   | https://your.acrolinx-instance.com                 |
| ACCESS_TOKEN             | Your Access Token. Adds the `X-Acrolinx-Auth` header.                                | eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOi... |
| SIGNATURE                | Your Client Signature. Adds the `X-Acrolinx-Client` header.                          | SW50ZWdyYXRpb25EZXZlbG9wbWVudERlbW9Pbmx5           |
| base64_username_password | Username and password, in `username:password` format. Must be base64 encoded string. | dGVzdHVzZXI6cGFzc3dvcmQ=                           |
| user_id                  | Any User id that exists. It can be used in User API and other user-related requests. | 4f86f443-e5e3-49c9-93da-cb1f89cd28c7               |
| role_id                  | Any Role id that exists. It can be used in Role API and other role-related requests. | fdcd7fc6-9715-42f8-a947-88812bc02b2a               |

