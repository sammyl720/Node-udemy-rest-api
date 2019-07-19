## REST Concepts & Ideas

 * REST APIs are all about data, no UI logic is exchanged

 * REST APIs are normal node servers which expose diffent endpoints (Http method + path) for clients to send requests to
 * JSON is the common data format that is used both for requests and responses
 * REST APIs are decoupled from the client that use them.

 ***

 ### Requests & Responses

 * Attach data in JSON format and let the other end know by setting [ __Content-Type__ ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)Header

 * CORS errors occur when using an API that does not set [CORS Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)