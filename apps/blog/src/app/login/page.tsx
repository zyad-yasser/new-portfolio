import { LoginScreen } from "@repo/auth-ui/login-screen";

export default function LoginPage() {
  return (
    <LoginScreen
      appTitle="Zyad Yasser Blog"
      description="Log in to write or manage your posts"
      postLoginPath="/mine"
      brandMarkClassName="bg-gradient-brand"
      cardClassName="glass"
      submitClassName="btn-glow"
    />
  );
}
