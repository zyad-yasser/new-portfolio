import { SignupScreen } from "@repo/auth-ui/signup-screen";

export default function SignupPage() {
  return (
    <SignupScreen
      appTitle="Zyad Yasser Blog"
      description="Sign up to write posts"
      postSignupPath="/mine"
      brandMarkClassName="bg-gradient-brand"
      cardClassName="glass"
      submitClassName="btn-glow"
    />
  );
}
