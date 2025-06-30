const globalConfig = {
	BOT_TYPING_EFFECT_INTERVAL: 50, // in ms

	// Is default prompts enabled?
	IS_DEFAULT_PROMPTS_ENABLED: true,
	// Default prompts to display in the chat
	DISPLAY_DEFAULT_PROMPTS_BUTTON: "Not sure what to ask? Try our suggestions!",
	// This are the chat bubbles that will be displayed in the chat
	CHAT_MESSAGES: [],
	// This are the labels for the chat button and input
	CHAT_BUTTON_LABEL_TEXT: "Ask for Health Advice",
	CHAT_CANCEL_BUTTON_LABEL_TEXT: "Cancel Response",
	CHAT_VOICE_BUTTON_LABEL_TEXT: "Voice Input",
	CHAT_VOICE_REC_BUTTON_LABEL_TEXT: "Listening...",
	CHAT_INPUT_PLACEHOLDER:
		'Type your health question, e.g. "What are some tips for a balanced diet?"',
	USER_IS_BOT: "Healthy Living Advisor",
	RESET_BUTTON_LABEL_TEXT: "Reset",
	RESET_BUTTON_TITLE_TEXT: "Reset current question",
	RESET_CHAT_BUTTON_TITLE: "Reset chat session",
	// Copy response to clipboard
	COPY_RESPONSE_BUTTON_LABEL_TEXT: "Copy Advice",
	COPIED_SUCCESSFULLY_MESSAGE: "Advice copied!",
	// Follow up questions text
	FOLLOW_UP_QUESTIONS_LABEL_TEXT: "You can also ask about...",
	SHOW_THOUGH_PROCESS_BUTTON_LABEL_TEXT: "Show reasoning",
	HIDE_THOUGH_PROCESS_BUTTON_LABEL_TEXT: "Hide reasoning",
	LOADING_INDICATOR_TEXT:
		"Please wait. Your healthy living advice is being prepared...",
	LOADING_TEXT: "Loading advice...",
	// API ERROR HANDLING IN UI
	API_ERROR_MESSAGE:
		"Sorry, we are having some issues. Please try again later.",
	INVALID_REQUEST_ERROR:
		"Unable to generate advice for this query. Please rephrase your question and try again.",
	// Config pertaining the response format
	THOUGHT_PROCESS_LABEL: "Reasoning",
	SUPPORT_CONTEXT_LABEL: "Health Context",
	CITATIONS_LABEL: "Learn More:",
	CITATIONS_TAB_LABEL: "References",
	// Custom Branding
	IS_CUSTOM_BRANDING: true,
	// Custom Branding details
	// All these should come from persistence config
	BRANDING_URL:
		"https://www.logopeople.in/wp-content/uploads/2023/09/hospital-logo2.jpg",
	BRANDING_LOGO_ALT: "Healthy Living Advisor Logo",
	BRANDING_HEADLINE: "Welcome to the Healthy Living Advisor Chat!",
	SHOW_CHAT_HISTORY_LABEL: "Show Health History",
	HIDE_CHAT_HISTORY_LABEL: "Hide Health History",
	CHAT_MAX_COUNT_TAG: "{MAX_CHAT_HISTORY}",
	CHAT_HISTORY_FOOTER_TEXT: "Showing past {MAX_CHAT_HISTORY} health conversations",
};

const teaserListTexts = {
	TEASER_CTA_LABEL: "Ask for Health Advice",
	HEADING_CHAT: "Chat with the Healthy Living Expert",
	HEADING_ASK: "Ask a health question",
	DEFAULT_PROMPTS: [
		{
			description: "How can I improve my sleep quality?",
		},
		{
			description: "What are effective ways to manage stress?",
		},
		{
			description: "How much exercise should I get each week?",
		},
	],
};

const NEXT_QUESTION_INDICATOR = 'Next Questions:';

const requestOptions = {
  approach: 'rrr',
  overrides: {
    retrieval_mode: 'hybrid',
    semantic_ranker: true,
    semantic_captions: false,
    suggest_followup_questions: true,
  },
};

const chatHttpOptions = {
  // API URL for development purposes
  url: 'http://localhost:3001',
  method: 'POST',
  stream: true,
};

const MAX_CHAT_HISTORY = 5;

const APPROACH_MODEL = ['rrr', 'rtr'];

export {
  globalConfig,
  requestOptions,
  chatHttpOptions,
  NEXT_QUESTION_INDICATOR,
  APPROACH_MODEL,
  teaserListTexts,
  MAX_CHAT_HISTORY,
};
