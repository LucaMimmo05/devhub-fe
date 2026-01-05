import * as React from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export interface SubmitButtonProps
  extends React.ComponentProps<typeof Button> {
  loading?: boolean;
}

const SubmitButton = React.forwardRef<
  HTMLButtonElement,
  SubmitButtonProps
>(({ loading = false, disabled, children, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      type="submit"
      disabled={loading || disabled}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </Button>
  );
});

SubmitButton.displayName = "SubmitButton";

export default SubmitButton;
