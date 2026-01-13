import Logo from "@/assets/Logo";
import { Button } from "@/components/ui/button";
import PageContainer from "@/layouts/PageContainer";
import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";

const NotFound = () => {
  const error = useRouteError();
  console.error(error);

  let errorTitle = "404";
  let errorSubtitle = "Page Not Found";
  let errorMessage = "The page you are looking for does not exist.";

  if (error) {
    errorTitle = "Error";
    errorSubtitle = "Something went wrong";
    if (isRouteErrorResponse(error)) {
      errorMessage = error.statusText || error.data?.message || "Not Found";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = "Unknown error occurred";
    }
  }

  return (
    <PageContainer className="min-h-screen h-screen">
      <div className="absolute top-6 left-6">
        <Logo size="sm" />
      </div>

      <div className="flex justify-center md:text-start md:justify-start items-center px-12 gap-12 h-full">
        <div className="flex flex-col gap-4 items-start">
          <h1 className="xl:text-[16rem] md:text-9xl text-7xl font-bold text-accent leading-none">
            {errorTitle}
          </h1>

          <h2 className=" xl:text-4xl text-2xl  font-medium">
            {errorSubtitle}
          </h2>

          <p className="text-muted-foreground max-w-md">{errorMessage}</p>

          <Button className="mt-1 w-full md:w-30" asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default NotFound;
