import { ChatResponseError } from '../../utils/index.js';

export async function callHttpApi(
  { question, type, approach, overrides, messages }: ChatRequestOptions,
  { method,url, stream, signal }: ChatHttpOptions,
) {
  return await fetch(`${url}/${type}`, {
		method: method,
		headers: {
			"Content-Type": "application/json",
		},
		signal,
		body: JSON.stringify({
			messages: [
				...(messages ?? []),
				// {
				// 	content: "You are a health consultant.",
				// 	role: "system",
				// },
				{
					content: question,
					role: "user",
				},
			],
			context: {
				...overrides,
				approach,
			},
			stream: type === "chat" ? stream : false,
		}),
	});
}

export async function getAPIResponse(
  requestOptions: ChatRequestOptions,
  httpOptions: ChatHttpOptions,
): Promise<BotResponse | Response | string> {
  const response = await callHttpApi(requestOptions, httpOptions);
console.log(
	"requestOptions",
	requestOptions,
	"httpOptions",
	httpOptions,
  "response",
	response
);
  // TODO: we should just use the value from httpOptions.stream
  const streamResponse = requestOptions.type === 'ask' ? false : httpOptions.stream;
  console.log('Stream response:', streamResponse);
  if (streamResponse) {
    return response;
  }
  console.log('Response received:', response);
  
  const parsedResponse: BotResponse = await response.json();
  console.log('Parsed response:', parsedResponse);
  if (response.status > 299 || !response.ok) {
    throw new ChatResponseError(response.statusText, response.status) || 'API Response Error';
  }
  return parsedResponse; // TODO: return the parsed response
}
