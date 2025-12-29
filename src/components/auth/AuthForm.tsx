import type { ReactNode } from "react";
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

interface AuthFormProps {
  title: string;
  description: string;
  children: ReactNode;
  submitText: string;

  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;

  showSocialAuth?: boolean;
  showForgotPassword?: boolean;
}

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
}: AuthFormProps) => {
  return (
    <section className="w-full max-w-sm">
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
                to="/forgot-password"
                className="hover:text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </p>
          )}

          <div className="pt-2">
            <Button className="w-full">{submitText}</Button>
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

              <div className="flex w-full gap-3">
                <Button variant="outline" className="flex-1 gap-2">
                  <SiGoogle className="h-4 w-4" />
                  Google
                </Button>

                <Button variant="outline" className="flex-1 gap-2">
                  <SiGithub className="h-4 w-4" />
                  GitHub
                </Button>
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
    </section>
  );
};
