  ### From 'Classic' to REST API

  * Most of the server-side code does not realy change, only requests + response data is affected
  * More HTTP methods are available
  * The REST API server does not care about the client, requests are handled in isolation => No session

### Authentication

* Doe to no sessions being used, authentication works diffently
* Each requests needs to be able to send some data that the requests is authenticated
* JSON Web Tokens ('JWT' ) are a common way of storing authentication information on the client and proving authentication status
* JWTs are signed by the server and can only be validated by the server
___

## REST Concepts & Ideas

 * REST APIs are all about data, no UI logic is exchanged

 * REST APIs are normal node servers which expose diffent endpoints (Http method + path) for clients to send requests to
 * JSON is the common data format that is used both for requests and responses
 * REST APIs are decoupled from the client that use them.

 ***

 ### Requests & Responses

 * Attach data in JSON format and let the other end know by setting [ __Content-Type__ ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)Header

 * CORS errors occur when using an API that does not set [CORS Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

 ___
