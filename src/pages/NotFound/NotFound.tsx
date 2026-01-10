import Logo from "@/assets/Logo";
import { Button } from "@/components/ui/button";
import PageContainer from "@/layouts/PageContainer";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <PageContainer className="min-h-screen h-screen">
      <div className="absolute top-6 left-6">
        <Logo size="sm" />
      </div>

      <div className="flex justify-center md:text-start md:justify-start items-center px-12 gap-12 h-full">
        <div className="flex flex-col gap-4 items-start">
          <h1 className="xl:text-[16rem] md:text-9xl text-7xl font-bold text-accent leading-none">
            404
          </h1>

          <h2 className=" xl:text-4xl text-2xl  font-medium">Page Not Found</h2>

          <p className="text-muted-foreground max-w-md">
            The page you are looking for does not exist.
          </p>

          <Button className="mt-1 w-full md:w-30"><Link to="/">Go Home</Link></Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default NotFound;
