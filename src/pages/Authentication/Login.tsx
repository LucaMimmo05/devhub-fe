import { AuthForm } from "@/components/auth/AuthForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  return (
    <AuthForm
      title="Welcome Back!"
      description="Log in to your DevHub workspace"
      submitText="Login"
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkTo="/auth/register"
      showForgotPassword={true}
    >
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Your password" />
      </div>
    </AuthForm>
  );
};

export default Login;
