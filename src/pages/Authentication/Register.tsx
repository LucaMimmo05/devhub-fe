import { AuthForm } from "@/components/auth/AuthForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Register = () => {
  return (
    <AuthForm
      title="Create an Account"
      description="Join DevHub today"
      submitText="Sign Up"
      footerText="Already have an account?"
      footerLinkText="Login"
      footerLinkTo="/auth/login"
    >
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" type="text" placeholder="John Doe" />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Create a password" />
      </div>
    </AuthForm>
  );
};

export default Register;
