# Acrolinx API

![Build](https://github.com/acrolinx/platform-api/actions/workflows/actions.yml/badge.svg)

Welcome to the Acrolinx API!
This documentation helps you:

* use the API directly
* build your own integration
* understand how Acrolinx interacts with integrations.

The [reference](#reference) describes all services and methods.

## Prerequisites

Contact [Acrolinx support](https://github.com/acrolinx/acrolinx-coding-guidance/blob/master/topics/support.md)
for consulting and getting your integration certified.
This sample works with a test license on an Acrolinx test instance.
The license is only meant for demonstration and development.
Once you finish coding, contact Acrolinx to get a license for your integration.
  
Acrolinx provides different SDKs and samples for building integrations.

Before you start building your own integration, you might want to read the following:

* [Getting started with custom integrations](https://docs.acrolinx.com/customintegrations)
* [How to integrate with Acrolinx](https://github.com/acrolinx/acrolinx-coding-guidance)
* [Acrolinx SDKs](https://github.com/acrolinx?q=sdk)
* [Acrolinx demo projects](https://github.com/acrolinx?q=demo).

## Get started

You'll need the following:

* An Acrolinx instance URL
* A user on that Acrolinx instance
* A signature (more on that later)
* A way to make http calls
* A way to read and write JSON strings

Familiarize yourself with the following concepts: 
* [authentication](https://github.com/acrolinx/acrolinx-coding-guidance/blob/master/topics/configuration.md)
* [signatures](https://github.com/acrolinx/acrolinx-coding-guidance/blob/master/topics/packaging.md#packaging)
* [document](https://github.com/acrolinx/acrolinx-coding-guidance/blob/master/topics/text-extraction.md).

If you can't wait, jump to the [Quick start tutorial](quickstart.md) and start playing around.

## Important headers and content type

Always include the following headers:

```HTTP
X-Acrolinx-Auth: YOUR_ACCESS_TOKEN
X-Acrolinx-Client: YOUR_SIGNATURE;YOUR_VERSION
Content-Type:application/json
```

Individual topics explain the contents of these headers.
All requests to the Acrolinx API should contain these headers.

## Authentication

To use the Authentication API, you'll need an access token.
Send the access token with the header parameter `X-Acrolinx-Auth` for every API request.

```HTTP
X-Acrolinx-Auth:SOME_ACCESS_TOKEN_STRING
```

Access tokens are associated with a user and come in two forms:

* default access tokens that you get by signing in to Acrolinx
* API tokens.

Access tokens normally have a lifetime of 30 days. After that, you have to renew them.

API tokens have a lifespan of 4 years.

## Get an access token with Acrolinx sign-in

The Acrolinx sign-in process is for individual users to sign in.
An Acrolinx web application handles the authentication.

This is how it works:

![Sign-in diagram](doc/sign-in.png)

1. Integration requests an access token:

    ```HTTP
    POST: https://tenant.acrolinx.cloud/api/v1/auth/sign-ins
    ```

2. Acrolinx returns two URLs: an `interactive` and a `poll` URL in a result like this:

    ```HTTP
    {
        "data": {
            "state": "Started",
            "interactiveLinkTimeout": 900
        },
        "links": {
            "interactive": "https://tenant.acrolinx.cloud/dashboard.html?login=19901-2-8412998412",
            "poll": "https://tenant.acrolinx.cloud/api/v1/auth/sign-ins/185-0ijfgklejt2390tui"
        }
    }
    ```

3. Prompt the `interactive` URL for the user to authenticate.
    Poll with the `poll` URL until you get an http response (code 200).

    ```HTTP
    {
        "data": {
            "state": "Success",
            "accessToken": "123579080a8d1fee12490a90dc3",
            "authorizedUsing": "ACROLINX_SIGN_IN",
            "privileges": [
            "CheckingAndClients.checkingApplications",
            "CheckingAndClients.submitDictionaryEntry"
            ],
            "userId": "fred"
        },
        "links": {
            "user": "https://tenant.acrolinx.cloud/api/v1/user/fred"
        }
    }
    ```

## Create an API token

Creating an API Token is easy:

* Sign in to Acrolinx
* Go to ‘Settings'
* Click CREATE API TOKEN.
* Copy the API token.

**Note**
As soon as you generate an API token, save it somewhere secure (like a password manager) so that you can access it again. Once you leave the Settings page, the API token will disappear from the display.

## Signature

A signature is a string that identifies an integration.
During development, you should use the following signature:

```TEXT
SW50ZWdyYXRpb25EZXZlbG9wbWVudERlbW9Pbmx5
```

Once Acrolinx certifies your integration, you'll get your own signature.

Inclue the signature as a header in every request you send to the Acrolinx API:

```HTTP
X-Acrolinx-Client: YOUR_SIGNATURE; VERSION_NUMBER
```

The `VERSION_NUMBER` should follow the following pattern `X.X.X.X` like `1.0.0.1`.

You don't have to send a
[version and build number](https://github.com/acrolinx/acrolinx-coding-guidance/blob/master/topics/project-setup.md#version-information).
But to get [certified](https://github.com/acrolinx/acrolinx-coding-guidance/blob/master/topics/checklist.md),
your integration must send this information.
Maintaining your integration in production is much easier with a version and build number.

## FAQ (frequently asked questions)

* How do I authenticate and use SSO?
    + Authentication requires either an API token or Acrolinx sign-in.
      Acrolinx sign-in supports different SSO methods that use PingFederate.
* How do the API and automation SDKs (Java, JavaScript, etc.) work together?
    + We build SDKs on top of the API and use the API to provide a basic framework in languages like Java or JavaScript.
* Can I include hierarchies in the document reference, for example: `<book>`, `<chapter>`, `<section>`
  so Acrolinx reporting groups all check results for the book, chapter, etc.?
    + If you want to group content, you should use document custom fields. You can also use the API to manage custom fields.
      Acroilnx uses the document reference to identify a piece of content but Acrolinx doesn't use the document reference to group content.
* Can I add a link for each document in a batch check so the Content Analysis Dashboard provides a link back to the documents in the overview?
    + In most cases, a document reference is the link to your content.
      If you need to provide a separate or different link, you can use custom fields.

## Reference

### [Rendered version on apiary.io](https://acrolinxapi.docs.apiary.io/#)

### [Plain version](apiary.apib)

## License

Copyright 2018-present Acrolinx GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at:

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

For more information visit: [https://www.acrolinx.com](https://www.acrolinx.com)
