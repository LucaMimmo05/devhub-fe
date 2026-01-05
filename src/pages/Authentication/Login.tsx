import { AuthForm } from "@/components/auth/AuthForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Errore nel componente Login:", err);
    }
  };

  return (
    <AuthForm
      title="Welcome Back!"
      description="Log in to your DevHub workspace"
      submitText="Login"
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkTo="/auth/register"
      showForgotPassword={true}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          placeholder="you@example.com"
        />
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          placeholder="Your password"
        />
      </div>
    </AuthForm>
  );
};

export default Login;
