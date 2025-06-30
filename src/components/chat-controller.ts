import { type ReactiveController, type ReactiveControllerHost } from "lit";
import { getAPIResponse } from "../core/http/index.js";
import { parseStreamedMessages } from "../core/parser/index.js";
import {
	type ChatResponseError,
	getTimestamp,
	processText,
} from "../utils/index.js";
import { globalConfig } from "../config/global-config.js";

export class ChatController implements ReactiveController {
	host: ReactiveControllerHost;
	private _generatingAnswer = false;
	private _isAwaitingResponse = false;
	private _isProcessingResponse = false;
	private _processingMessage: ChatThreadEntry | undefined = undefined;
	private _abortController: AbortController = new AbortController();

	get isAwaitingResponse() {
		return this._isAwaitingResponse;
	}

	get isProcessingResponse() {
		return this._isProcessingResponse;
	}

	get processingMessage() {
		return this._processingMessage;
	}

	get generatingAnswer() {
		return this._generatingAnswer;
	}

	set generatingAnswer(value: boolean) {
		this._generatingAnswer = value;
		this.host.requestUpdate();
	}

	set processingMessage(value: ChatThreadEntry | undefined) {
		this._processingMessage = value
			? {
					...value,
			  }
			: undefined;
		this.host.requestUpdate();
	}

	set isAwaitingResponse(value: boolean) {
		this._isAwaitingResponse = value;
		this.host.requestUpdate();
	}

	set isProcessingResponse(value: boolean) {
		this._isProcessingResponse = value;
		this.host.requestUpdate();
	}

	constructor(host: ReactiveControllerHost) {
		(this.host = host).addController(this);
	}

	hostConnected() {
		// no-op
	}

	hostDisconnected() {
		// no-op
	}

	private clear() {
		this._isAwaitingResponse = false;
		this._isProcessingResponse = false;
		this._generatingAnswer = false;
		this.host.requestUpdate(); // do update once
	}

	reset() {
		this._processingMessage = undefined;
		this.clear();
	}

	async processResponse(
		response: string | BotResponse,
		isUserMessage: boolean = false,
		useStream: boolean = false
	) {
		// console.log(
		// 	"processResponse called with:",
		// 	response,
		// 	"isUserMessage:",
		// 	isUserMessage,
		// 	"useStream:",
		// 	useStream
		// );
		const citations: Citation[] = [];
		const followingSteps: string[] = [];
		const followupQuestions: string[] = [];
		const timestamp = getTimestamp();
		let thoughts: string | undefined;
		let dataPoints: string[] | undefined;

		const updateChatWithMessageOrChunk = async (
			message: string | BotResponse,
			chunked: boolean
		) => {
			console.log(
				"updateChatWithMessageOrChunk called with:",
				message,
				"chunked:",
				chunked
			);
			this.processingMessage = {
				id: crypto.randomUUID(),
				text: [
					{
						value: chunked ? "" : (message as string),
						followingSteps,
					},
				],
				followupQuestions,
				citations: [...new Set(citations)],
				timestamp: timestamp,
				isUserMessage,
				thoughts,
				dataPoints,
			};
			if (chunked && this.processingMessage) {
				this.isProcessingResponse = true;
				this._abortController = new AbortController();
				await parseStreamedMessages({
					chatEntry: this.processingMessage,
					signal: this._abortController.signal,
					apiResponseBody: (message as unknown as Response).body,
					onChunkRead: (updated) => {
						this.processingMessage = updated;
					},
					onCancel: () => {
						this.clear();
					},
				});
				this.clear();
			}
		};

		// Main logic for displaying the response
		if (isUserMessage || typeof response === "string") {
			// console.log(
			// 	"processResponse: treating as user message or string",
			// 	response
			// );
			await updateChatWithMessageOrChunk(response as string, false);
		} else if (useStream) {
			// console.log("processResponse: treating as stream", response);
			await updateChatWithMessageOrChunk(response, true);
		} else {
			// Debug logs to inspect the response structure
			console.log("BotResponse received:", response);
			let generatedResponse;
			try {
				if ((response as BotResponse)?.choices) {
					generatedResponse = (response as BotResponse).choices[0]?.message;
				} else if ((response as any)?.message) {
					generatedResponse = (response as any).message;
				} else {
					generatedResponse = undefined;
				}
				console.log("Extracted generatedResponse:", generatedResponse);
			} catch (e) {
				generatedResponse = undefined;
			}
			// Debug: Log the raw choices object for inspection
			console.log("Raw choices object:", (response as BotResponse)?.choices);
			if (!generatedResponse || !generatedResponse.content) {
				// fallback: show raw content if available, else show error
				const fallback =
					typeof response === "object" && (response as any).content
						? (response as any).content
						: globalConfig.API_ERROR_MESSAGE;
				console.log(
					"processResponse: fallback triggered, fallback value:",
					fallback
				);
				await updateChatWithMessageOrChunk(fallback, false);
				return;
			}
			console.log("Calling processText with:", generatedResponse.content, [
				citations,
				followingSteps,
				followupQuestions,
			]);
			// Process the text and update UI
			const processedText = processText(generatedResponse.content, [
				citations,
				followingSteps,
				followupQuestions,
			]);
			const messageToUpdate = processedText.replacedText;
			// Debug: Log the processed text and message to update
			console.log("Processed text:", processedText);
			console.log("messageToUpdate:", messageToUpdate);
			// Push all lists coming from processText to the corresponding arrays
			citations.push(...(processedText.arrays[0] as unknown as Citation[]));
			followingSteps.push(...(processedText.arrays[1] as string[]));
			followupQuestions.push(...(processedText.arrays[2] as string[]));
			thoughts = generatedResponse.context?.thoughts ?? "";
			dataPoints = generatedResponse.context?.data_points ?? [];
			console.log(
				"processResponse: successfully processed and updating chat with:",
				messageToUpdate
			);
			await updateChatWithMessageOrChunk(messageToUpdate, false);
		}
	}

	async generateAnswer(
		requestOptions: ChatRequestOptions,
		httpOptions: ChatHttpOptions
	) {
		const { question } = requestOptions;

		if (question) {
			try {
				this.generatingAnswer = true;
				console.log("Generating answer for question:", question);

				// for chat messages, process user question as a chat entry
				if (requestOptions.type === "chat") {
					await this.processResponse(question, true, false);
				}

				this.isAwaitingResponse = true;
				this.processingMessage = undefined;

				// Disable streaming for now to simplify the response handling
				const responseOptions = { ...httpOptions, stream: false };

				const response = (await getAPIResponse(
					requestOptions,
					responseOptions
				)) as BotResponse;
				this.isAwaitingResponse = false;

				await this.processResponse(response, false, httpOptions.stream);
			} catch (error_: any) {
				const error = error_ as ChatResponseError;

				// Extract error message from different possible locations
				let errorMessage = "An unexpected error occurred. Please try again.";

				if (error?.message) {
					errorMessage = error.message;
				} else if (error_?.response?.data?.error?.message) {
					errorMessage = error_.response.data.error.message;
				} else if (typeof error_ === "string") {
					errorMessage = error_;
				}
				
				const chatError = {
					message:
						error?.code === 400
							? globalConfig.INVALID_REQUEST_ERROR
							: globalConfig.API_ERROR_MESSAGE,
				};

				if (!this.processingMessage) {
					// add a empty message to the chat thread to display the error
					await this.processResponse(chatError.message, false, false);
				}
			} finally {
				this.clear();
			}
		}
	}

	cancelRequest() {
		this._abortController.abort();
	}
}
