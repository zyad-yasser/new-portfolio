export type OAuthErrorContent = {
  title: string;
  description: string;
  canRetry: boolean;
};

const FALLBACK: OAuthErrorContent = {
  title: "Sign-in failed",
  description:
    "Something went wrong while signing you in with that provider. Please try again, or use your email and password.",
  canRetry: true,
};

const CONTENT: Record<string, OAuthErrorContent> = {
  account_not_linked: {
    title: "This email already has an account",
    description:
      "An account with this email address already exists but isn't connected to this provider yet. Log in with your email and password first, then connect the provider from Privacy & Security in your settings. If you never verified your email, verify it first — we can only connect a provider to a verified account.",
    canRetry: false,
  },
  unable_to_link_account: {
    title: "Couldn't connect that account",
    description:
      "We couldn't connect that provider to your account. This usually means the provider hasn't confirmed the email address on its side.",
    canRetry: false,
  },
  account_already_linked_to_different_user: {
    title: "Already connected elsewhere",
    description:
      "That provider account is already connected to a different account here. Disconnect it there first, or sign in with the account it belongs to.",
    canRetry: false,
  },
  "email_doesn't_match": {
    title: "Email doesn't match",
    description:
      "The email on that provider account doesn't match the email on your account. Use the provider account with the same email address.",
    canRetry: false,
  },
  signup_disabled: {
    title: "Sign-ups are closed",
    description: "This account can't be created here.",
    canRetry: false,
  },
  unable_to_get_user_info: {
    title: "Couldn't read your profile",
    description:
      "The provider didn't share the profile information we need — usually an email address. Check the permissions you granted and try again.",
    canRetry: true,
  },
  invalid_code: {
    title: "Sign-in expired",
    description: "That sign-in attempt expired before it finished. Please try again.",
    canRetry: true,
  },
  no_code: {
    title: "Sign-in was cancelled",
    description: "The provider didn't complete the sign-in. Please try again.",
    canRetry: true,
  },
  access_denied: {
    title: "Permission declined",
    description:
      "You declined the permissions needed to sign in. Please try again and accept them, or use your email and password.",
    canRetry: true,
  },
  unable_to_create_user: {
    title: "Couldn't create your account",
    description: "We couldn't finish creating your account. Please try again.",
    canRetry: true,
  },
  unable_to_create_session: {
    title: "Couldn't start your session",
    description: "We signed you in but couldn't start a session. Please try again.",
    canRetry: true,
  },
};

export function getOAuthErrorContent(code: string | null | undefined): OAuthErrorContent {
  if (!code) {
    return FALLBACK;
  }
  return CONTENT[code] ?? FALLBACK;
}
