import { SignupScreen } from "@repo/auth-ui/signup-screen";

export default function SignupPage() {
  return (
    <SignupScreen
      appTitle="Zyad Yasser Reviews"
      description="Sign up to leave a review"
      postSignupPath="/submit"
      brandMarkClassName="bg-primary"
      cardClassName="border-border/60"
    />
  );
}
