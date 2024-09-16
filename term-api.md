# Acrolinx Terminology API v7

## Deprecation Note

**Warning:** Communication using the SDL *MultiTerm XML* format is deprecated.
While it still works today, support can be removed at any time.

## Preliminaries

All service operations are demonstrated by a `curl` (cf. [curl man page](http://curl.haxx.se/docs/manpage.html)) command
line that can be executed against a real Acrolinx Core Platform installation, replacing any variable references
`${variable}` by the appropriate values.

### Authorization

Before invoking any Terminology API, the Acrolinx Integration must authorize and acquire a session.
The authorization itself isn’t part of the Terminology API, but the [Core Platform Core API](README.md#authentication).
API Requests without a valid session ID in the `Authorization` HTTP header field fail:

```bash
curl -i -H "Accept: application/vnd.acrolinx.mtf+xml" -X GET http://${serverHostName}:8031/iq/services/v7/rest/terminology/entries/a918fccf-4a94-4398-b260-4d792289952c
```

```text
HTTP/1.1 403 Forbidden
Content-Type: application/json
Date: Wed, 12 Mar 2014 16:34:51 GMT
exception_message: Invalid session  (no such session)
exception_type: com.acrolinx.services.faults.InvalidSessionFault
Transfer-Encoding: chunked

{
    "message": "Invalid session  (no such session)",
    "errors": {
    "exception_type": "com.acrolinx.services.faults.InvalidSessionFault",
    "exception_message": "Invalid session  (no such session)"
    }
}
```

### Acquiring a Session

Using the authentication token, the integration now needs to open a session, specifying the session-type (always
`TERMINOLOGY` for usage of the terminology API) and the signature of the integration (see section Signatures below).

Example of a session request body:

```json
{
    "sessionType": "TERMINOLOGY",
    "clientSignature": "SW50ZWdyYXRpb25EZXZlbG9wbWVudERlbW9Pbmx5",
    "clientInfo": {
    "buildNumber": "unknown",
    "clientHostname": "localhost",
    "version": "0.1",
    "name": "Terminology Test Client",
    "clientHostApplication": "unknown",
    "clientLoginName": "unknown"
    }
}
```

To request a session, do a `POST` on `/iq/services/v3/rest/core/requestSession`:

```bash
curl -i -H "Content-Type: application/json; charset=UTF-8" -H "authToken: ${authToken}" -H "connection: keep-alive" -X POST http://${serverHostName}:8031/iq/services/v3/rest/core/requestSession -d "{\"sessionType\":\"TERMINOLOGY\",\"clientSignature\":\"${clientSignature}\",\"clientInfo\":{\"name\":\"terminology-example\",\"version\":\"1\",\"buildNumber\":\"1\",\"clientLoginName\":\"unknown\",\"clientHostname\":\"${clientHostName}\",\"clientHostApplication\":\"unknown\"}}"
```

```text
    HTTP/1.1 200 OK
    Content-Type: text/plain
    Date: Wed, 12 Mar 2014 16:34:51 GMT
    Content-Length: 16

    56429c06fbd5da74
```

The returned session token should be used in subsequent requests to the Terminology API. It’s valid until
the session is released by the integration or by the Core Platform.
As the license limits the number of concurrently opened sessions,
an integration mustn’t forget to release a session before acquiring a new session token.

### Releasing a Session

A session can be released by a `DELETE` on `/iq/services/v3/rest/core/releaseSession`, providing the session as path
parameter:

```bash
curl -i -X DELETE http://${serverHostName}:8031/iq/services/v3/rest/core/releaseSession/${session2}
```

```text
HTTP/1.1 204 No Content
Content-Length: 0
Date: Wed, 12 Mar 2014 16:34:51 GMT
```

#### Signatures

An integration must identify itself to the Core Platform by means of a unique signature. This signature tells the Core
Platform which integration is trying to communicate to it. Depending on the signature the communication might be allowed.
Signatures can be enabled individually in the Core Platform's license. To request a session with the Core Platform, an integration's
signature is one of the required parameters. If the signature is unknown to the Core Platform,
no session can be opened and further communication isn’t possible.

Acrolinx issues specific signatures to integrators.

## Terminology Service Methods

The prefix to all v7 terminology API service paths is `http://${serverHostName}:8031/iq/services/v7/rest/terminology`.

Required privileges:

- for all terminology service API methods, the user must have at least the `Access API-based terminology applications`
  privilege

### Configuration

Before invoking one of the Terminology API services for the result format SDL MultiTerm, the Core Platform must be
configured correctly. This includes that there are XSL transformations from ACTIF to SDL MultiTerm XML and SDL MultiTerm
Definition XDT.  The needed XSL style sheets will be available as part of the Core Platform resources.

The availability of those resources can be checked in the Acrolinx Dashboard on
`Terminology -> Import and Export -> Import/Export -> Custom File Format`.

### Media/Content Types

Except for application-specific XML data (ACTIF resp. SDL MultiTerm XML/XDT data), request, and response data is usually
either plain text or in JSON format. The encoding is usually assumed to be UTF-8.

With some service methods, you can control the format of the return values by means of the standard HTTP `Accept` header.

Service methods that accept application-specific body data rely on the correct setting of the standard HTTP
`Content-Type` header.

The supported media types are listed where applicable.

### Getting Existing Entries by UUID or ID

Supported media types:

- `application/vnd.acrolinx.actif+xml`: return entries as ACTIF in XML
- `application/vnd.acrolinx.mtf+xml`: return entries as SDL MultiTerm XML

Required privilege:

- Terminology - View Terms

This functionality is provided by `GET` `/entries`. There are two variants of this operation:

- asking for a single UUID or ID
- asking for many UUIDs or IDs

For asking for only one entry simply, append its UUID to the service URI:

```bash
curl -i -H "Accept: application/vnd.acrolinx.mtf+xml" -H "Authorization: session ee7ac269aed25b4e" -X GET http://${serverHostName}:8031/iq/services/v7/rest/terminology/entries/a918fccf-4a94-4398-b260-4d792289952c
```

```text
HTTP/1.1 200 OK
Content-Type: application/vnd.acrolinx.mtf+xml
Date: Wed, 12 Mar 2014 16:34:51 GMT
Content-Length: 8521

<?xml version="1.0" encoding="utf-8"?><mtf><conceptGrp><concept>13</concept><descripGrp><descrip type="ENTRY_UUID">a918fccf-4a94-4398-b260-4d792289952c</descrip></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T11:00:04</date></transacGrp><languageGrp><language lang="EN" type="English"/><termGrp><term>return air</term><descripGrp><descrip type="Status">preferred</descrip></descripGrp><descripGrp><descrip type="domain">Technical_Names</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">120bdf01-4818-4a2c-bcea-4f875b6b129a</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695606</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T11:00:04</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="NL" type="Dutch"/><termGrp><term>text nicht vorhanden</term><descripGrp><descrip type="Status">proposed</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">680e0ea1-90f1-48ab-9ec9-5a362360692d</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695622</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T12:11:20+02:00</date></transacGrp><transacGrp><transac type="modification">marco.aeschimann@ch.sauter-bc.com</transac><date>2011-07-05T10:54:28+02:00</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="ES" type="Spanish"/><termGrp><term>text nicht vorhanden</term><descripGrp><descrip type="Status">proposed</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">01352af7-73e6-4024-9433-930846681b56</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695630</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T12:11:19+02:00</date></transacGrp><transacGrp><transac type="modification">eric.schneider@ch.sauter-bc.com</transac><date>2011-09-13T10:47:25+02:00</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="DE" type="German"/><termGrp><term>Abluftmenge</term><descripGrp><descrip type="Status">proposed</descrip></descripGrp><descripGrp><descrip type="domain">Technical_Names</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">44641d47-ddf3-4bb4-b1d4-a22a3fb42f64</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695646</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T10:59:47</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="FR" type="French"/><termGrp><term>débit d'air repris</term><descripGrp><descrip type="Status">preferred</descrip></descripGrp><descripGrp><descrip type="domain">Technical_Names</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">5334a674-848b-44a3-8b42-1756d38717ef</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695614</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T10:59:54</date></transacGrp></termGrp><termGrp><term>débit d'évacuation</term><descripGrp><descrip type="Status">deprecated</descrip></descripGrp><descripGrp><descrip type="domain">Technical_Names</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">38e4ce12-4175-465e-a26f-4bb6d8a7ea15</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695654</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T10:59:58</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="IT" type="Italian"/><termGrp><term>text nicht vorhanden</term><descripGrp><descrip type="Status">proposed</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">7958d666-8511-4c0e-aef1-d0f4748d2d46</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695638</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T12:11:18+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2011-08-30T11:55:38+02:00</date></transacGrp></termGrp></languageGrp></conceptGrp></mtf>
```

This works the same way for entry IDs (the server determines by the format of the passed ID string whether it’s a UUID or
an ID):

```bash
curl -i -H "Accept: application/vnd.acrolinx.mtf+xml" -H "Authorization: session ee7ac269aed25b4e" -X GET http://${serverHostName}:8031/iq/services/v7/rest/terminology/entries/13
```

```text
HTTP/1.1 200 OK
Content-Type: application/vnd.acrolinx.mtf+xml
Date: Wed, 12 Mar 2014 16:34:51 GMT
Content-Length: 8521

<?xml version="1.0" encoding="utf-8"?><mtf><conceptGrp><concept>13</concept><descripGrp><descrip type="ENTRY_UUID">a918fccf-4a94-4398-b260-4d792289952c</descrip></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T11:00:04</date></transacGrp><languageGrp><language lang="EN" type="English"/><termGrp><term>return air</term><descripGrp><descrip type="Status">preferred</descrip></descripGrp><descripGrp><descrip type="domain">Technical_Names</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">120bdf01-4818-4a2c-bcea-4f875b6b129a</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695606</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T11:00:04</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="NL" type="Dutch"/><termGrp><term>text nicht vorhanden</term><descripGrp><descrip type="Status">proposed</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">680e0ea1-90f1-48ab-9ec9-5a362360692d</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695622</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T12:11:20+02:00</date></transacGrp><transacGrp><transac type="modification">marco.aeschimann@ch.sauter-bc.com</transac><date>2011-07-05T10:54:28+02:00</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="ES" type="Spanish"/><termGrp><term>text nicht vorhanden</term><descripGrp><descrip type="Status">proposed</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">01352af7-73e6-4024-9433-930846681b56</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695630</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T12:11:19+02:00</date></transacGrp><transacGrp><transac type="modification">eric.schneider@ch.sauter-bc.com</transac><date>2011-09-13T10:47:25+02:00</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="DE" type="German"/><termGrp><term>Abluftmenge</term><descripGrp><descrip type="Status">proposed</descrip></descripGrp><descripGrp><descrip type="domain">Technical_Names</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">44641d47-ddf3-4bb4-b1d4-a22a3fb42f64</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695646</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T10:59:47</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="FR" type="French"/><termGrp><term>débit d'air repris</term><descripGrp><descrip type="Status">preferred</descrip></descripGrp><descripGrp><descrip type="domain">Technical_Names</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">5334a674-848b-44a3-8b42-1756d38717ef</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695614</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T10:59:54</date></transacGrp></termGrp><termGrp><term>débit d'évacuation</term><descripGrp><descrip type="Status">deprecated</descrip></descripGrp><descripGrp><descrip type="domain">Technical_Names</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">38e4ce12-4175-465e-a26f-4bb6d8a7ea15</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695654</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T10:59:58</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="IT" type="Italian"/><termGrp><term>text nicht vorhanden</term><descripGrp><descrip type="Status">proposed</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">7958d666-8511-4c0e-aef1-d0f4748d2d46</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695638</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T12:11:18+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2011-08-30T11:55:38+02:00</date></transacGrp></termGrp></languageGrp></conceptGrp></mtf>
```

For the more general case, to ask for many entries at the same time specify the UUIDs (or IDs) as a comma-separated list
after the `/entries/` endpoint URL:

```bash
curl -i -H "Accept: application/vnd.acrolinx.mtf+xml" -H "Authorization: session ee7ac269aed25b4e" -H "Content-Type: application/json" -X GET http://${serverHostName}:8031/iq/services/v7/rest/terminology/entries/a918fccf-4a94-4398-b260-4d792289952c,ee1c8221-5ac2-465a-bcb8-2f329ba0da8a
```

```text
HTTP/1.1 200 OK
Content-Type: application/vnd.acrolinx.mtf+xml
Date: Wed, 12 Mar 2014 16:34:51 GMT
Content-Length: 11081

<?xml version="1.0" encoding="utf-8"?><mtf><conceptGrp><concept>1391421694240</concept><descripGrp><descrip type="ENTRY_UUID">ee1c8221-5ac2-465a-bcb8-2f329ba0da8a</descrip></descripGrp><transacGrp><transac type="origination">admin</transac><date>2014-02-03T11:01:34</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T11:01:36</date></transacGrp><languageGrp><language lang="DE" type="German"/><termGrp><term>neuer Term</term><descripGrp><descrip type="Status">preferred</descrip></descripGrp><descripGrp><descrip type="domain">Technical_Names</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">79425649-0a70-458a-8cf8-910539b9a1f3</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1391189614395</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2014-02-03T11:01:34</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T11:01:36</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="EN" type="English"/><termGrp><term>new term</term><descripGrp><descrip type="Status">proposed</descrip></descripGrp><descripGrp><descrip type="domain">Technical_Names</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">06208308-e8ca-4dbd-91fd-add7ca4f5e90</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1391189614561</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2014-02-03T11:01:51</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T11:01:51</date></transacGrp></termGrp></languageGrp></conceptGrp><conceptGrp><concept>13</concept><descripGrp><descrip type="ENTRY_UUID">a918fccf-4a94-4398-b260-4d792289952c</descrip></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T11:00:04</date></transacGrp><languageGrp><language lang="EN" type="English"/><termGrp><term>return air</term><descripGrp><descrip type="Status">preferred</descrip></descripGrp><descripGrp><descrip type="domain">Technical_Names</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">120bdf01-4818-4a2c-bcea-4f875b6b129a</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695606</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T11:00:04</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="NL" type="Dutch"/><termGrp><term>text nicht vorhanden</term><descripGrp><descrip type="Status">proposed</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">680e0ea1-90f1-48ab-9ec9-5a362360692d</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695622</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T12:11:20+02:00</date></transacGrp><transacGrp><transac type="modification">marco.aeschimann@ch.sauter-bc.com</transac><date>2011-07-05T10:54:28+02:00</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="ES" type="Spanish"/><termGrp><term>text nicht vorhanden</term><descripGrp><descrip type="Status">proposed</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">01352af7-73e6-4024-9433-930846681b56</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695630</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T12:11:19+02:00</date></transacGrp><transacGrp><transac type="modification">eric.schneider@ch.sauter-bc.com</transac><date>2011-09-13T10:47:25+02:00</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="DE" type="German"/><termGrp><term>Abluftmenge</term><descripGrp><descrip type="Status">proposed</descrip></descripGrp><descripGrp><descrip type="domain">Technical_Names</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">44641d47-ddf3-4bb4-b1d4-a22a3fb42f64</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695646</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T10:59:47</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="FR" type="French"/><termGrp><term>débit d'air repris</term><descripGrp><descrip type="Status">preferred</descrip></descripGrp><descripGrp><descrip type="domain">Technical_Names</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">5334a674-848b-44a3-8b42-1756d38717ef</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695614</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T10:59:54</date></transacGrp></termGrp><termGrp><term>débit d'évacuation</term><descripGrp><descrip type="Status">deprecated</descrip></descripGrp><descripGrp><descrip type="domain">Technical_Names</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">38e4ce12-4175-465e-a26f-4bb6d8a7ea15</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695654</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T10:59:58</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="IT" type="Italian"/><termGrp><term>text nicht vorhanden</term><descripGrp><descrip type="Status">proposed</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">7958d666-8511-4c0e-aef1-d0f4748d2d46</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695638</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T12:11:18+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2011-08-30T11:55:38+02:00</date></transacGrp></termGrp></languageGrp></conceptGrp></mtf>
```

**Note: The length of the request URL is limited by any HTTP server implementation. Based to our tests, we don't
recommend exceeding the value of 4000 characters.**

### Querying the Term Base Structure

Supported media types:

- `application/vnd.acrolinx.actif+xml`: return schema as ACTIF in XML
- `application/vnd.acrolinx.mtf+xdt`: return entries as SDL MultiTerm XDT

Required privilege:

- Terminology - View Terms

This functionality is provided by GET `/schema`. The structure of the Acrolinx term base can then be retrieved as
follows (in the example the SDL MultiTerm XDT representation is requested):

```bash
curl -i -H "Accept: application/vnd.acrolinx.mtf+xdt" -H "Authorization: session ee7ac269aed25b4e" -X GET http://${serverHostName}:8031/iq/services/v7/rest/terminology/schema
```

```text
HTTP/1.1 200 OK
Content-Type: application/vnd.acrolinx.mtf+xdt
Date: Wed, 12 Mar 2014 16:34:52 GMT
Content-Length: 21990

<?xml version="1.0" encoding="utf-8"?><Output xmlns:dt="urn:schemas-microsoft-com:datatypes"><Object><Tree><Node ID="0"><TextChild dt:dt="string">Entry level</TextChild><NodeType dt:dt="i4">0</NodeType><Mandatory dt:dt="boolean">1</Mandatory><Multiply dt:dt="boolean">1</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/><Node ID="0"><TextChild dt:dt="string">ENTRY_UUID</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">1</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">sourceOfDefinition</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">definition</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">Project ID</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">imageURL</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">Index level</TextChild><NodeType dt:dt="i4">2</NodeType><Mandatory dt:dt="boolean">1</Mandatory><Multiply dt:dt="boolean">1</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/><Node ID="0"><TextChild dt:dt="string">Term level</TextChild><NodeType dt:dt="i4">3</NodeType><Mandatory dt:dt="boolean">1</Mandatory><Multiply dt:dt="boolean">1</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/><Node ID="0"><TextChild dt:dt="string">Status</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">1</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">domain</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">1</Mandatory><Multiply dt:dt="boolean">1</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">MORPHOSYNTACTIC_RESTRICTION</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">1</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">TERM_UUID</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">1</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">TERM_ID</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">VARIANTS_CONFIGURATIONS</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">1</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">HISTORY_EVENT</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">1</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">assignedTo</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">project</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">termType</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">externalCrossReference</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">processStatus</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">geographicalUsage</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">crossReference</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">Number</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">sourceOfTerm</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">Usage note</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">customer</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">Unit</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">Part of Speech</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">gender</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">Core</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">Phrase</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">note space</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node><Node ID="0"><TextChild dt:dt="string">context</TextChild><NodeType dt:dt="i4">1</NodeType><Mandatory dt:dt="boolean">0</Mandatory><Multiply dt:dt="boolean">0</Multiply><Readonly dt:dt="boolean">0</Readonly><labels/><description/></Node></Node></Node></Node></Tree><Languages><ItemLocale>AR</ItemLocale><ItemText>Arabic</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>BG</ItemLocale><ItemText>Bulgarian</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>CS</ItemLocale><ItemText>Czech</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>DE</ItemLocale><ItemText>German</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>EN</ItemLocale><ItemText>English</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>EN-GB</ItemLocale><ItemText>English (UK)</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>EN-US</ItemLocale><ItemText>English (USA)</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>ES</ItemLocale><ItemText>Spanish</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>FR</ItemLocale><ItemText>French</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>IT</ItemLocale><ItemText>Italian</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>JA</ItemLocale><ItemText>Japanese</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>KO</ItemLocale><ItemText>Korean</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>NL</ItemLocale><ItemText>Dutch</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>NO</ItemLocale><ItemText>Norwegian</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>PT</ItemLocale><ItemText>Portuguese</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>RU</ItemLocale><ItemText>Russian</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>SV</ItemLocale><ItemText>Swedish</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>ZH</ItemLocale><ItemText>Chinese</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>ZH-CN</ItemLocale><ItemText>Chinese (PRC)</ItemText><IsTargetOnly>false</IsTargetOnly><ItemLocale>ZH-TW</ItemLocale><ItemText>Chinese (Taiwan)</ItemText><IsTargetOnly>false</IsTargetOnly></Languages><TerminologyFields><Node ID="0"><TextChild dt:dt="string">ENTRY_UUID</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">sourceOfDefinition</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">definition</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">Project ID</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">imageURL</TextChild><Structure><Type>Multimedia File</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">Status</TextChild><Structure><Type>Picklist</Type><PicklistValue>proposed</PicklistValue><PicklistValue>proposed_from_search</PicklistValue><PicklistValue>deprecated</PicklistValue><PicklistValue>admitted</PicklistValue><PicklistValue>preferred</PicklistValue><PicklistValue>non-term</PicklistValue><PicklistValue>stopword</PicklistValue><PicklistValue>no-single-term</PicklistValue><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">domain</TextChild><Structure><Type>Picklist</Type><PicklistValue>undefined domain</PicklistValue><PicklistValue>customer</PicklistValue><PicklistValue>Special Symbols</PicklistValue><PicklistValue>Demo</PicklistValue><PicklistValue>Switches</PicklistValue><PicklistValue>Keitaidenwa</PicklistValue><PicklistValue>KanaKanjiUsage</PicklistValue><PicklistValue>ADSL</PicklistValue><PicklistValue>MFP</PicklistValue><PicklistValue>Drucker</PicklistValue><PicklistValue>Acrolinx</PicklistValue><PicklistValue>Standard_Terminology</PicklistValue><PicklistValue>Routers</PicklistValue><PicklistValue>Belkin</PicklistValue><PicklistValue>D-Link</PicklistValue><PicklistValue>Cisco</PicklistValue><PicklistValue>Phone</PicklistValue><PicklistValue>ASD-STE100</PicklistValue><PicklistValue>Technical_Names</PicklistValue><PicklistValue>TN_1_Official_Parts_Information</PicklistValue><PicklistValue>TN_2_Locations_On_Machines_Vehicles_Or_Equipment</PicklistValue><PicklistValue>TN_3_Tools_Or_Equipment</PicklistValue><PicklistValue>TN_4_Materials_Consumables_Or_Unwanted_Matter</PicklistValue><PicklistValue>TN_5_Facilities_And_Infrastructure</PicklistValue><PicklistValue>TN_6_Circuits_Or_Systems</PicklistValue><PicklistValue>TN_7_Mathematical_Scientific_Or_Engineering_Terms</PicklistValue><PicklistValue>TN_8_Navigation</PicklistValue><PicklistValue>TN_9_Numbers_Units_Of_Measurement_Or_Dial_Markings</PicklistValue><PicklistValue>TN_10_Quoted_Text</PicklistValue><PicklistValue>TN_11_Persons_Groups_Or_Bodies</PicklistValue><PicklistValue>TN_12_Body_Parts</PicklistValue><PicklistValue>TN_13_Common_Personal_Effects</PicklistValue><PicklistValue>TN_14_Medical_Terms</PicklistValue><PicklistValue>TN_15_Documents_Or_Manuals</PicklistValue><PicklistValue>TN_16_Names_Headings_And_Topics_In_Specifications</PicklistValue><PicklistValue>TN_17_Technical_Records_Standards_Specifications_Or_Regulations</PicklistValue><PicklistValue>TN_18_Environmental_Conditions</PicklistValue><PicklistValue>TN_19_Colors</PicklistValue><PicklistValue>TN_20_Damage_Terms</PicklistValue><PicklistValue>TN_Unclassified</PicklistValue><PicklistValue>Technical_Verbs</PicklistValue><PicklistValue>TV_1_Manufacturing_Processes</PicklistValue><PicklistValue>TV_2_Computer_Processes_And_Applications</PicklistValue><PicklistValue>TV_3_Descriptions</PicklistValue><PicklistValue>TV_Unclassified</PicklistValue><PicklistValue>S1000D Bike Data Set</PicklistValue><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">MORPHOSYNTACTIC_RESTRICTION</TextChild><Structure><Type>Picklist</Type><PicklistValue>all</PicklistValue><PicklistValue>noun</PicklistValue><PicklistValue>verb</PicklistValue><PicklistValue>adjective</PicklistValue><PicklistValue>adverb</PicklistValue><PicklistValue>adposition</PicklistValue><PicklistValue>preposition</PicklistValue><PicklistValue>determiner</PicklistValue><PicklistValue>conjunction</PicklistValue><PicklistValue>pronoun</PicklistValue><PicklistValue>prefix</PicklistValue><PicklistValue>suffix</PicklistValue><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">TERM_UUID</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">TERM_ID</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">VARIANTS_CONFIGURATIONS</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">HISTORY_EVENT</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">assignedTo</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">project</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">termType</TextChild><Structure><Type>Picklist</Type><PicklistValue>trademark</PicklistValue><PicklistValue>undefined</PicklistValue><PicklistValue>full form</PicklistValue><PicklistValue>acronym</PicklistValue><PicklistValue>abbreviation</PicklistValue><PicklistValue>short form</PicklistValue><PicklistValue>variant</PicklistValue><PicklistValue>phrase</PicklistValue><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">externalCrossReference</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">processStatus</TextChild><Structure><Type>Picklist</Type><PicklistValue>unprocessed</PicklistValue><PicklistValue>provisionally processed</PicklistValue><PicklistValue>finalized</PicklistValue><PicklistValue>review requested</PicklistValue><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">geographicalUsage</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">crossReference</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">Number</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">sourceOfTerm</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">Usage note</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">customer</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">Unit</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">Part of Speech</TextChild><Structure><Type>Picklist</Type><PicklistValue>adjective</PicklistValue><PicklistValue>adverb</PicklistValue><PicklistValue>noun</PicklistValue><PicklistValue>other</PicklistValue><PicklistValue>proper noun</PicklistValue><PicklistValue>undefined</PicklistValue><PicklistValue>verb</PicklistValue><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">gender</TextChild><Structure><Type>Picklist</Type><PicklistValue>undefined</PicklistValue><PicklistValue>masculine</PicklistValue><PicklistValue>feminine</PicklistValue><PicklistValue>neuter</PicklistValue><PicklistValue>other</PicklistValue><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">Core</TextChild><Structure><Type>Picklist</Type><PicklistValue>undefined</PicklistValue><PicklistValue>core</PicklistValue><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">Phrase</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">note space</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node><Node ID="0"><TextChild dt:dt="string">context</TextChild><Structure><Type>Text</Type><History>F</History></Structure></Node></TerminologyFields><Option dt:dt="i4">2</Option><CaseSensitive dt:dt="boolean">1</CaseSensitive><IgnoreNonAlpha dt:dt="boolean">0</IgnoreNonAlpha><TermbaseDescription>Exported from Acrolinx at 2014-03-12 17:34:52</TermbaseDescription><CopyrightText/><SplashImage/><IconFile/><RefInfo/></Object><Schema><Schema name="Termbase Definition"><ElementType name="mtf" content="eltOnly" order="many"><description/><ElementType name="conceptGrp" content="eltOnly" order="many"><description/><Occurences><Level minOccurs="1" maxOccurs="*"/></Occurences><ElementType name="concept" content="textOnly" order="many" type="ui4"><description/><Occurences><Level minOccurs="1" maxOccurs="1"/></Occurences></ElementType><ElementType name="system" content="textOnly" order="many" type="ui4"><description/><Occurences><Level minOccurs="0" maxOccurs="1"/></Occurences></ElementType><ElementType name="transacGrp" content="eltOnly" order="many"><description/><Occurences><Level minOccurs="0" maxOccurs="*"/></Occurences><ElementType name="transac" content="textOnly" order="many" type="string"><description/><Occurences><Level minOccurs="0" maxOccurs="*"/></Occurences><AttributeType name="type" type="enumeration" values="origination|modification"><description/><Occurences><Level minOccurs="1" maxOccurs="1"/></Occurences></AttributeType></ElementType><ElementType name="date" content="textOnly" order="many" type="date"><description/><Occurences><Level minOccurs="0" maxOccurs="*"/></Occurences></ElementType></ElementType><ElementType name="descripGrp" content="eltOnly" order="many" history="F"><description/><Occurences><Level minOccurs="0" maxOccurs="*"/></Occurences><ElementType name="descrip" content="mixed" order="many" type="string"><description/><Occurences><Level minOccurs="0" maxOccurs="*"/></Occurences><AttributeType name="type" type=""><description/><Occurences><Level minOccurs="1" maxOccurs="1"/></Occurences></AttributeType></ElementType></ElementType><ElementType name="languageGrp" content="eltOnly" order="many"><description/><Occurences><Level minOccurs="0" maxOccurs="*"/></Occurences><ElementType name="language" content="empty" order="many"><description/><Occurences><Level minOccurs="0" maxOccurs="*"/></Occurences><AttributeType name="lang" type=""><description/><Occurences><Level minOccurs="1" maxOccurs="1"/></Occurences></AttributeType><AttributeType name="type" type=""><description/><Occurences><Level minOccurs="1" maxOccurs="1"/></Occurences></AttributeType></ElementType><ElementType name="termGrp" content="eltOnly" order="many"><description/><Occurences><Level minOccurs="1" maxOccurs="*"/></Occurences><ElementType name="term" content="textOnly" order="many" type="string"><description/><Occurences><Level minOccurs="1" maxOccurs="1"/></Occurences></ElementType></ElementType><ElementType name="descripGrp" content="eltOnly" order="many" history="F"><description/><Occurences><Level minOccurs="0" maxOccurs="*"/></Occurences><ElementType name="descrip" content="mixed" order="many" type="string"><description/><Occurences><Level minOccurs="0" maxOccurs="*"/></Occurences><AttributeType name="type" type=""><description/><Occurences><Level minOccurs="1" maxOccurs="1"/></Occurences></AttributeType></ElementType></ElementType><ElementType name="transacGrp" content="eltOnly" order="many"><description/><Occurences><Level minOccurs="0" maxOccurs="*"/></Occurences><ElementType name="transac" content="textOnly" order="many" type="string"><description/><Occurences><Level minOccurs="0" maxOccurs="*"/></Occurences><AttributeType name="type" type="enumeration" values="origination|modification"><description/><Occurences><Level minOccurs="1" maxOccurs="1"/></Occurences></AttributeType></ElementType><ElementType name="date" content="textOnly" order="many" type="date"><description/><Occurences><Level minOccurs="0" maxOccurs="*"/></Occurences></ElementType></ElementType></ElementType></ElementType></ElementType></Schema></Schema></Output>
```

### Querying for Available Filters

The only supported media type is `application/json`.

Required privilege:

- Terminology - View Terms

The terminology service API offers an operation to get the ids/names of all filters for term search operations, that are
available to the user in the current session. The available filters can be retrieved by `GET` to `/filters`:

```bash
curl -i -H "Accept: application/json" -H "Authorization: session ee7ac269aed25b4e" -X GET http://${serverHostName}:8031/iq/services/v7/rest/terminology/filters
```

```text
HTTP/1.1 200 OK
Content-Type: application/json
Date: Wed, 12 Mar 2014 16:34:52 GMT
Transfer-Encoding: chunked

{
    "user": "admin",
    "filters": [
    {
        "id": "Preferred Technical Names"
    },
    {
        "id": "SEO"
    },
    {
        "id": "Images"
    }
]
}
```

The filters can be referenced by their `id` in a search API operation, described in the next section.

### Searching Terms

Terms can be searched by:

- term `name`, supporting '%' as wildcard;
- `language` id
- `domains` an array of one or several domain names
- `filter` id
- or any combination of the above

The individual fields of the search criteria need to be "escaped" by their unicode positions in case they contain
characters that would otherwise break the JSON request string. For example, the apostrophe/single quote character `'` is
escaped as `\u0027`.

The search API supports pagination to retrieve only a certain subset of the result set. The parameters are:

- `offset`, the index of the first term to display (starting from 0, where the terms are always sorted ascending by
  their name)
- `limit`, the maximal number of terms to return, starting from `offset`; if < 1, no limit is imposed

The only supported media type for request as well as result is `application/json`.

Required privilege:

- Terminology - View Terms

The search-terms service function requires a request object in the format illustrated by the following example:

```json
{
    "criteria": {
    "name": "d\\u00e9bit%",
    "language": "fr",
    "domains": ["Technical Names", "Demo"],
    "filter": "Preferred Technical Names"
    },
    "pagination": {
    "offset": 0,
    "limit": -1
    }
}
```

The `criteria` and `pagination` values are mandatory, as well as `offset` and `limit`, but you can leave out (or set to
`null`) those fields of `criteria` that aren’t required by a specific query (for `domains` you can also pass an empty
array `[]`).

The criteria that exist in the search request are then combined by AND (if `domains` contains more than one value, they’re
 combined into a domain filter by OR-ing them) in the resulting filter.

You can then search with those settings by submitting a `POST`-request to `/searchTerms`:

```bash
curl -i -H "Content-Type: application/json; charset=UTF-8" -H "Accept: application/json" -H "Authorization: session ee7ac269aed25b4e" -X POST http://${serverHostName}:8031/iq/services/v7/rest/terminology/searchTerms -d '{"criteria":{"name":"d%","language": "fr","domains":["undefined domain", "Technical Names"], "filter":null},"pagination":{"offset": 0,"limit": -1}}'
```

```text
HTTP/1.1 200 OK
Content-Type: application/json
Date: Wed, 12 Mar 2014 16:34:52 GMT
Transfer-Encoding: chunked

{
    "terms": [
    {
        "name": "débit d\u0027air repris",
        "status": "preferred",
        "domains": [
        "Technical_Names",
        "undefined domain"
        ],
        "uuid": "5334a674-848b-44a3-8b42-1756d38717ef",
        "entry": {
        "uuid": "a918fccf-4a94-4398-b260-4d792289952c",
        "id": "13"
        }
    },
    {
        "name": "débit d\u0027évacuation",
        "status": "deprecated",
        "domains": [
        "Technical_Names",
        "undefined domain"
        ],
        "uuid": "38e4ce12-4175-465e-a26f-4bb6d8a7ea15",
        "entry": {
        "uuid": "a918fccf-4a94-4398-b260-4d792289952c",
        "id": "13"
        }
    }
    ],
    "search": {
    "pagination": {
        "offset": 0,
        "limit": -1
    },
    "criteria": {
        "name": "d%",
        "language": "fr",
        "filter": null,
        "domains": [
        "undefined domain",
        "Technical Names"
        ]
    }
    },
    "totalResultCount": 2
}
```

(Note: there exists indeed a domain name `undefined domain` in the Core Platform default setup;
that value doesn't indicate the absence of a value for the domain.)

The response is a JSON object with the following attributes:

- `search` contains your search criteria and pagination settings; you could reuse that object for subsequent calls with
  the same criteria
- `totalResultCount` is the total number of hits for the search, before applying the pagination limit
- `terms`: an array of term objects, each containing the attributes `name`, `status`, `domains`, `uuid` (the UUID of the
  term: use that UUID to identify the specific term data from the full entry that you retrieve by the entry UUID),
  `entry`; `entry` again is an object with two attributes `uuid` and `id`, the UUID, and ID of the entry. Using the entry
  UUID or ID you can then retrieve the entire entry via `GET` `/entries` (see above).

If there are no matching terms (or you request an offset greater than the result count), `terms` will be an empty array.
If your search request refers to a nonexistent filter, the server will respond with a 400 (Bad Request).

### Getting Terms with Search Criteria

You can also search for terms using an older method called `findTerms`, which supports some search criteria that
aren’t available in the `searchTerms` method above, and which also returns the result in a specified target format,
just like `get entries` described above.

The following search criteria are supported:

- term `surface` (name), supporting '%' as wildcard
- `language` id
- `domain` - a single domain name
- `entry ID/UUID` - an array of entry IDs or entry UUIDs
- custom criteria - an array of `field=value` strings, where `field` is one of the following ACTIF field names:
    + `term/id`
    + `term/uuid`
    + `entry/id`
    + `enty/uuid`
    + `term/creation-date-time` (prepend with `<` or `>` to find terms created before or after the given date)
    + `term/last-modification-date-time` (prepend with `<` or `>` to find terms modified before or after the given date)
    + `term/creator-user-name`
    + `term/last-modifier`
    + any custom field name (as it appears in ACTIF)

The individual fields of the search criteria need to be "escaped" by their unicode positions in case they contain
characters that would otherwise break the JSON request string. For example, the apostrophe/single quote character `'` is
escaped as `\u0027`.

All criteria are combined with `AND` when the term filter is constructed. All criteria are optional; if you don’t give
any criteria, the result includes all terms.

The desired result format needs to be specified in the required `format` attribute of the request object (not in the
`Accept` HTTP header). The supported media types are the same as for the "get entries" method above:

- `application/vnd.acrolinx.actif+xml`: return terms as ACTIF in XML
- `application/vnd.acrolinx.mtf+xml`: return terms as SDL MultiTerm XML

Finally, you can optionally have the term base structure (schema) included in the response by setting the `withSchema`
attribute to `true`.

Required privilege:

- Terminology - View Terms

The find-terms service function requires a request object in the format illustrated by the following example:

```json
{
    "surface": "d\\u00e9bit%",
    "language": "fr",
    "domain": ["Demo"],
    "customCriteria": [
    "term/creation-date-time=<2012-05-10T11:41:00",
    "customWorkflowStatus=reviewed"
    ],
    "withSchema": false,
    "format": "application/vnd.acrolinx.mtf+xml"
}
```

You can then search with those settings by `POST`ing the request to `/findTerms/<session>`. (Note that the terminology
session is part of the URL here; the `Authorization` header is ignored.)

```bash
curl -i -H \"Content-Type: application/json; charset=UTF-8\" -X POST http://${serverHostName}:8031/iq/services/v7/rest/terminology/findTerms/ee7ac269aed25b4e -d '{"name":"d%","language": "fr","customCriteria":["term/uuid=a918fccf-4a94-4398-b260-4d792289952c"], "format":"application/vnd.acrolinx.mtf+xml"}'
```

```text
HTTP/1.1 200 OK
Content-Type: application/vnd.acrolinx.mtf+xml
Date: Wed, 12 Mar 2014 16:34:51 GMT
Content-Length: 8521

<?xml version="1.0" encoding="utf-8"?><mtf><conceptGrp><concept>13</concept><descripGrp><descrip type="ENTRY_UUID">a918fccf-4a94-4398-b260-4d792289952c</descrip></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T11:00:04</date></transacGrp><languageGrp><language lang="EN" type="English"/><termGrp><term>return air</term><descripGrp><descrip type="Status">preferred</descrip></descripGrp><descripGrp><descrip type="domain">Technical_Names</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">120bdf01-4818-4a2c-bcea-4f875b6b129a</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695606</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T11:00:04</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="NL" type="Dutch"/><termGrp><term>text nicht vorhanden</term><descripGrp><descrip type="Status">proposed</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">680e0ea1-90f1-48ab-9ec9-5a362360692d</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695622</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T12:11:20+02:00</date></transacGrp><transacGrp><transac type="modification">marco.aeschimann@ch.sauter-bc.com</transac><date>2011-07-05T10:54:28+02:00</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="ES" type="Spanish"/><termGrp><term>text nicht vorhanden</term><descripGrp><descrip type="Status">proposed</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">01352af7-73e6-4024-9433-930846681b56</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695630</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T12:11:19+02:00</date></transacGrp><transacGrp><transac type="modification">eric.schneider@ch.sauter-bc.com</transac><date>2011-09-13T10:47:25+02:00</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="DE" type="German"/><termGrp><term>Abluftmenge</term><descripGrp><descrip type="Status">proposed</descrip></descripGrp><descripGrp><descrip type="domain">Technical_Names</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">44641d47-ddf3-4bb4-b1d4-a22a3fb42f64</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695646</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T10:59:47</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="FR" type="French"/><termGrp><term>débit d'air repris</term><descripGrp><descrip type="Status">preferred</descrip></descripGrp><descripGrp><descrip type="domain">Technical_Names</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">5334a674-848b-44a3-8b42-1756d38717ef</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695614</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T10:59:54</date></transacGrp></termGrp><termGrp><term>débit d'évacuation</term><descripGrp><descrip type="Status">deprecated</descrip></descripGrp><descripGrp><descrip type="domain">Technical_Names</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">38e4ce12-4175-465e-a26f-4bb6d8a7ea15</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695654</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T11:55:28+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2014-02-03T10:59:58</date></transacGrp></termGrp></languageGrp><languageGrp><language lang="IT" type="Italian"/><termGrp><term>text nicht vorhanden</term><descripGrp><descrip type="Status">proposed</descrip></descripGrp><descripGrp><descrip type="domain">undefined domain</descrip></descripGrp><descripGrp><descrip type="TERM_UUID">7958d666-8511-4c0e-aef1-d0f4748d2d46</descrip></descripGrp><descripGrp><descrip type="TERM_ID">1371197695638</descrip></descripGrp><descripGrp><descrip type="term/frequency">0</descrip></descripGrp><descripGrp><descrip type="Core">undefined</descrip></descripGrp><descripGrp><descrip type="Part of Speech">undefined</descrip></descripGrp><descripGrp><descrip type="gender">undefined</descrip></descripGrp><descripGrp><descrip type="processStatus">unprocessed</descrip></descripGrp><descripGrp><descrip type="termType">undefined</descrip></descripGrp><descripGrp><descrip type="MORPHOSYNTACTIC_RESTRICTION"/></descripGrp><transacGrp><transac type="origination">admin</transac><date>2011-06-28T12:11:18+02:00</date></transacGrp><transacGrp><transac type="modification">admin</transac><date>2011-08-30T11:55:38+02:00</date></transacGrp></termGrp></languageGrp></conceptGrp></mtf>
```

### Searching Entry UUIDs and IDs by Domain

You can retrieve all or only the entries (represented by their UUID and ID) of specific domains by using the
`searchEntries` service endpoint. This service works similar to the "search terms" service, but you can only specify a
list of domains as search criterion, for example:

```json
{
    "criteria": {
        "domains": ["Technical_Names", "Demo"]
    }
}
```

- Passing a nonempty array will get you all entries that contain at least one term that is assigned to at least one of
  the specified domains.
- Passing an empty array for domains will get you all entries.

Example:

```bash
curl -i -H "Content-Type: application/json; charset=UTF-8" -H "Accept: application/json" -H "Authorization: session ee7ac269aed25b4e" -X POST http://${serverHostName}:8031/iq/services/v7/rest/terminology/searchEntries -d '{"criteria":{"domains":["undefined domain", "Technical_Names"]}}'
```

```text
HTTP/1.1 200 OK
Content-Type: application/json
Date: Wed, 12 Mar 2014 16:34:52 GMT
Transfer-Encoding: chunked

{
    "entries": [
        {
            "uuid": "a918fccf-4a94-4398-b260-4d792289952c",
            "id": "13"
        },
        {
            "uuid": "ee1c8221-5ac2-465a-bcb8-2f329ba0da8a",
            "id": "1391421694240"
        }
    ],
    "search": {
        "criteria": {
            "domains": [
                "undefined domain",
                "Technical_Names"
            ]
        }
    },
    "totalResultCount": 2
}
```

The response is a JSON object with the following attributes:

- `search` contains your search criteria
- `totalResultCount` is the total number of entries matching the criterion
- `entries`: an array of entries, each containing the attributes `id`, and `uuid`. Using the entry UUID or ID you can then
  retrieve the entire entry via `GET` `/entries` (see above).

### Creation and Update of Entries and Terms

Entries and their terms can be created and updated by `POST`ing the respective ACTIF or SDL MultiTerm XML representation
to `/entries`.
Whether an existing entry is updated or a new entry created crucially depends on the entry UUID specified in the sent
data.
If the entry UUID references an existing entry in the database, all terms and fields of the entry will be replaced by
the sent data.
Specifically, if the sent entry data contains fewer terms than the existing entry in the database, those terms missing
from the sent entry data will be deleted.

Otherwise, that is, no entry of the same UUID exists, a new entry will be created.

Supported media types are:

- `application/vnd.acrolinx.actif+xml`: ACTIF in XML
- `application/vnd.acrolinx.mtf+xml`: SDL MultiTerm XML

Required privileges:

- Terminology - Import terms (implies "Edit terms")
- Terminology - Change the status of a term

Return codes:

- For both creation and update, the return code is 201 (created) and the "Location" header gets the
  URL of the inserted/updated entry.
- If the input data doesn't contain an entry that needs to be created or updated, you'll see a 204 (no content).
- If the input data contains more than one entry (which is allowed), all entries in the input data will be created or updated respectively. However,
  the "Location" header will only contain the URL of one of them.

Example (sending [example-entry.actif.xml](doc/example-entry.actif.xml)):

```bash
curl -i -H "Accept: application/json" -H "Content-Type: application/vnd.acrolinx.actif+xml" -H "Authorization: session ee7ac269aed25b4e" -X POST http://${serverHostName}:8031/iq/services/v7/rest/terminology/entries -d "`cat doc/example-entry.actif.xml`"
```

```text
HTTP/1.1 100 Continue

HTTP/1.1 201 Created
Content-Length: 0
Date: Wed, 12 Mar 2014 16:34:52 GMT
Location: http://localhost:8031/iq/services/v7/rest/terminology/entries/a918fccf-4a94-4398-b260-4d792289952c
```

For this service call to succeed, the terminology database schemas
of the sent data and of the current database have to be compatible.
The terminology database schema is the definition of the field names and types, list items, etc.
In case of mismatches, the data is either inserted incompletely or might be rejected entirely with a 4xx error code.

### Deployment of Terminology

After terms and entries have been created or updated using the above method, they're not immediately available for
checking.
To make the new or updated terms available for checking, the terminology needs to be "deployed". Currently, triggering a
"deploy" of the terminology just causes all running language servers to reload their language configuration, which
includes the loading of the terminology.
Please note that a language becomes unavailable for checking for a certain amount of time up to several
minutes. Therefore terminology deployments should be scheduled for convenient times and not just done after each term
or entry update.

You only need to (re)deploy terms/entries in domains and languages the language configuration uses for
checking. For instance, when you've updated only the Arabic translation of a term, and there's no language
server running for Arabic, a "deploy" isn’t necessary.

Required privileges:

- Resources - Reload server configuration

To deploy the terminology, call `PUT` on `/deployTerminology`:

```bash
curl -i -H "Authorization: session ee7ac269aed25b4e" -X PUT http://${serverHostName}:8031/iq/services/v7/rest/terminology/deployTerminology
```

```text
HTTP/1.1 204 No Content
Content-Length: 0
Date: Wed, 12 Mar 2014 16:34:52 GMT
```

If the call is authorized, it always returns 204 (No Content).

### Deletion of Entries

Entire entries can be removed by calling `DELETE` on `/entries/{entryUUID}`. If an entry existed and could be deleted
successfully, the service returns 204 (No Content). Otherwise, if there’s no entry under the specified UUID, the
service returns 410 (Gone).

Required Privilege

- Terminology - Edit Terms

Example:

```bash
curl -i -H "Authorization: session ee7ac269aed25b4e" -X DELETE http://${serverHostName}:8031/iq/services/v7/rest/terminology/entries/a70b25cd-89a9-49c6-8548-87f846188b19
```

```text
HTTP/1.1 410 Gone
Content-Length: 0
Date: Wed, 12 Mar 2014 16:34:52 GMT
```

### Upload of Multimedia Files

A multimedia object can be uploaded to the Core Platform specifying a unique file name. We recommend using a scheme
based on newly generated UUIDs plus a readable part and the file extension. If an existing filename is used, the old one
will be replaced.

To transfer a media file to the Core Platform the term API service, call `POST` on `/media/{finaName}`.

Supported media types are:

- `image/*`: all images types, for example, `image/png`, `image/gif`, etc.
- `application/pdf`

Required privileges:

- Terminology - Import terms (implies "Edit terms")

Return codes:

- 201 (Created) in the case of success. The Location header contains the URL of the uploaded content.
- 404 (Not Found) if the filename contains a `/`.

Example:

```bash
curl -i -H "Authorization: session ee7ac269aed25b4e" -H "Content-Type: image/png" -X POST http://${serverHostName}:8031/iq/services/v7/rest/terminology/media/nav_bullet_red.png --data-binary "@nav_bullet_red.png"
```

```text
HTTP/1.1 201 Created
Content-Length: 0
Date: Wed, 12 Mar 2014 16:34:52 GMT
Location: http://@rab.local:8031/uploadedImages/nav_bullet_red.png
```

### Download of Multimedia Files

A multimedia object that has been uploaded through this API can be downloaded using the unique filename. To achieve
this, call `GET` on `/media/{filename}`.

Required privileges:

- Terminology - Export terms (implies "Read terms")

Return codes:

- In case of success, 200 (OK) and the response body contains the media file.
- 404 (Not Found) if the filename doesn't exist.

Example:

```bash
curl -i -H "Authorization: session ee7ac269aed25b4e" -H "Accept: image/png" -X GET http://${serverHostName}:8031/iq/services/v7/rest/terminology/media/nav_bullet_red.png
```

```text
HTTP/1.1 200 OK
Content-Type: image/png
Date: Wed, 12 Mar 2014 16:34:52 GMT
Transfer-Encoding: chunked
?PNG
IHDR   ????tEXtSoftwareAdobe ImageReadyq?e&lt;XIDATx?b??????? ħ??   ?9?x?#??(?bidA??v ?G] ?B??ӑ7q?? ?D?_?? ???0-'?,??͹IEND?B`?
```
