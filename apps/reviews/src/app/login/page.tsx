import { LoginScreen } from "@repo/auth-ui/login-screen";

export default function LoginPage() {
  return (
    <LoginScreen
      appTitle="Zyad Yasser Reviews"
      description="Log in to leave or manage your review"
      postLoginPath="/submit"
      brandMarkClassName="bg-primary"
      cardClassName="border-border/60"
    />
  );
}
