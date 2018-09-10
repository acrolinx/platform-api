# Acrolinx Platform API (0.7 Beta)

Hello and welcome to the Acrolinx Platform API.
This documentation is for you if you plan to use:

* the API directly,
* implement your own integration,
* or just want to know how the interaction between the Acrolinx Platform and its integrations works.

Currently the Acrolinx Platform API is in a BETA state and not final.
So things will change. However the main concepts will stay the same.

In the [reference](#reference), you can find the documentation for all services and methods.

## It's a Beta

The Acrolinx Platform API is still evolving and not stable.
We deploy the latest build daily.
If something doesn't work, check the next day if it works again.

## Prerequisites

Please contact [Acrolinx SDK support](sdk-support@acrolinx.com) for consulting and getting your integration certified.
This sample works with a test license on an internal Acrolinx URL.
This license is only meant for demonstration and developing purposes.
Once you finished your integration, you'll have to get a license for your integration from Acrolinx.
  
Acrolinx offers different other SDKs, and examples for developing integrations.

Before you start developing your own integration, you might benefit from looking into:

* [Getting Started with Custom Integrations](https://support.acrolinx.com/hc/en-us/articles/205687652-Getting-Started-with-Custom-Integrations),
* the [Guidance for the Development of Acrolinx Integrations](https://github.com/acrolinx/acrolinx-coding-guidance),
* the [Acrolinx SDKs](https://github.com/acrolinx?q=sdk), and
* the [Acrolinx Demo Projects](https://github.com/acrolinx?q=demo).

## Getting Started

You'll need the following:

* A URL of an Acrolinx Platform instance
* A user on that Acrolinx Platform instance
* A signature (more on that later)
* Any means to make http calls
* Any means of reading and writing JSON strings

Make yourself familiar with the concepts of [authentication](https://github.com/acrolinx/acrolinx-coding-guidance/blob/master/topics/configuration.md),
[signature](https://github.com/acrolinx/acrolinx-coding-guidance/blob/master/topics/packaging.md#packaging),
and [document](https://github.com/acrolinx/acrolinx-coding-guidance/blob/master/topics/text-extraction.md).
If you can't wait, you can also jump to the [Quick Start Tutorial](quickstart.md) and start tinkering around.

## Important Headers and Content Type

Make sure that you always include the following headers:

```HTTP
X-Acrolinx-Auth: YOUR_ACCESS_TOKEN
X-Acrolinx-Client: YOUR_CLIENT_SIGNATURE
Content-Type:application/json
```

More on the contents of these headers in the individual topics.
I general make sure that all requests to the Acrolinx Platform API are containing these headers.
Use Cases
Make sure that you actually need to use the API directly. We have SDKs and ready made integrations.
More information you can find here.

## Authentication

To make use of the API, you'll need to have an access token.
The access token needs to be sent for every request done to the API with the header parameter `X-Acrolinx-Auth`.

```HTTP
X-Acrolinx-Auth:SOME_ACCESS_TOKEN_STRING
```

Access tokens are bound to a user and there are two different variants:

* default access tokens that you're getting by signing in to Acrolinx, or
* API Tokens.

Access Tokens normally only have a total lifetime of 30 days. After that they have to be renewed.

API Tokens live much longer: 4 years.

## Getting and Access Token with Acrolinx Sign-In

The Acrolinx sign-in process is targeted at situations where you want individual users to sign in.
Authentication is handled by a web application of the Acrolinx Platform.

This is how it works:

![Sign-in diagram](doc/sign-in.png)

Integration requests an access token:

```HTTP
POST: https://tenant.acrolinx.cloud/api/v1/auth/sign-ins
```

The Platform will return two URLs. And `interactive` a `poll` in a result like this:

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

Promt the `interactive` URL to the user to authenticate.
Poll with the `poll` URL until you're getting an http response (code 200)

```HTTP
{
    "data": {
        "state": "Success",
        "authToken": "123579080a8d1fee12490a90dc3",
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

Please Note: the access token is called `authToken` in the response.

## Getting an API Token

Getting an API Token is easy:

* Sing-in to the Acrolinx Dashboard
* Click on ‘Settings' on the top
* Scroll down
* Click on ‘CREATE API TOKEN'
* Copy the API token. You can revisit this site later to get your token again.
* Scroll up and save the user.

![API Token](doc/creating_api_token.gif)

## Signature

The signature is a string that identifies your integration.
For developing purposes you should use the following:

```TEXT
SW50ZWdyYXRpb25EZXZlbG9wbWVudERlbW9Pbmx5
```

Once you've certified your integration, you'll get your own signature.

It should be included in every request you're doing to the Acrolinx Platform API as a header:

```HTTP
X-Acrolinx-Client: YOUR_CLIENT_SIGNATURE; VERSION_NUMBER; BUILD_NUMBER
```

The API won't complain if you don't send a
[version and build number](https://github.com/acrolinx/acrolinx-coding-guidance/blob/master/topics/project-setup.md#version-information).
For getting [certified](https://github.com/acrolinx/acrolinx-coding-guidance/blob/master/topics/checklist.md),
you must send this information.
Maintenance in production is getting much easier with a version and build number.

## Reference

### [Rendered Version on apiary.io](http://docs.acrolinxapi.apiary.io/#)

### [Plain Version](apiary.apib)