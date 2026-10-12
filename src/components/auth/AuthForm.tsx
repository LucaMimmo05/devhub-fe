import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiErrorMessage, startGithubLogin } from "@/utils/githubAuth";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { SiGithub, SiGoogle } from "react-icons/si";
import SubmitButton from "../ui/SubmitButton";
import { useAuth } from "@/context/AuthContext";

const GithubButton = () => {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await startGithubLogin();
        } catch (err) {
          setBusy(false);
          toast.error(apiErrorMessage(err, "GitHub sign-in isn't available right now."));
        }
      }}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <SiGithub className="h-4 w-4" />}
      Continue with GitHub
    </Button>
  );
};

type AuthFormProps = {
  title: string;
  description: string;
  children: ReactNode;
  submitText: string;

  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;

  showSocialAuth?: boolean;
  showForgotPassword?: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export const AuthForm = ({
  title,
  description,
  children,
  submitText,
  footerText,
  footerLinkText,
  footerLinkTo,
  showSocialAuth = true,
  showForgotPassword = false,
  onSubmit,
}: AuthFormProps) => {
  const { status } = useAuth();
  return (
    <form className="w-full max-w-sm" onSubmit={onSubmit}>
      <Card>
        <CardHeader className="text-center space-y-2 pb-8">
          <CardTitle className="text-3xl font-semibold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {children}

          {showForgotPassword && (
            <p className="text-center text-xs text-muted-foreground">
              <Link
                to="/auth/forgot-password"
                className="hover:text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </p>
          )}

          <div className="pt-2">
            <SubmitButton loading={status === "loading"} disabled={status === "loading"} className="w-full" type="submit">
              {submitText}
            </SubmitButton>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-6 pt-6">
          {showSocialAuth && (
            <>
              <div className="flex items-center w-full">
                <Separator className="flex-1" />
                <span className="mx-3 text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1" />
              </div>

              <div className="w-full space-y-2">
                {/* Signs in, or creates an account already connected to GitHub */}
                <GithubButton />
                <Button type="button" variant="outline" className="w-full gap-2" disabled aria-describedby="google-soon">
                  <SiGoogle className="h-4 w-4" />
                  Google
                </Button>
                <p id="google-soon" className="text-center text-xs text-muted-foreground">Google sign-in coming soon</p>
              </div>
            </>
          )}

          <p className="text-center text-xs text-muted-foreground">
            {footerText}{" "}
            <Link
              to={footerLinkTo}
              className="font-medium text-primary hover:underline"
            >
              {footerLinkText}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </form>
  );
};
