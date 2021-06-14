# Quick Start Tutorial

1. Load the [collection file](Acrolinx-API.postman_collection.json) in [POSTMAN](https://www.getpostman.com/).
2. Create a new [environment](https://learning.postman.com/docs/sending-requests/managing-environments/) and set an initial value for variables.
3. Happy API requests.  
  

## Variables

| Name                     | Description                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------ |
| ACROLINX_URL             | Your Acrolinx instance URL. Used in request paths.                                   |
| ACCESS_TOKEN             | Your Access Token. Adds the `X-Acrolinx-Auth` header.                                |
| SIGNATURE                | Your Client Signature. Adds the `X-Acrolinx-Client` header.                          |
| base64_username_password | Username and password, in `username:password` format. Must be base64 encoded string. |
| user_id                  | Any User id that exists. It can be used in User API and other user-related requests. |
| role_id                  | Any Role id that exists. It can be used in Role API and other role-related requests. |

