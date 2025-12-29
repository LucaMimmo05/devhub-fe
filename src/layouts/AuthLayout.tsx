import Logo from "@/assets/Logo";
import { Outlet } from "react-router-dom";
import PageContainer from "./PageContainer";
import AuthHero from "@/pages/Authentication/AuthHero";

const AuthLayout = () => {
  return (
    <PageContainer className="py-6 min-h-screen flex relative items-center justify-center xl:gap-64 md:gap-20 lg:gap-32 ">
      <Logo size="sm" className="absolute top-6 left-4 sm:left-6 lg:left-8" />
      <AuthHero />

      <Outlet />
    </PageContainer>
  );
};

export default AuthLayout;
