import { Separator } from "@/components/ui/separator"
const AuthHero = () => {
  return (
     <div className="space-y-6 hidden md:flex flex-col max-w-md ">

      <h1 className="text-6xl font-semibold tracking-tight">
        Hi, Hello!
      </h1>

      <p className="text-lg">
        Everything you need.
        <span className="text-primary font-semibold"> One developer hub.</span>
      </p>

      <Separator className="w-full" />

      <p className="xl:max-w-md text-sm leading-relaxed text-muted-foreground">
        DevHub is a modern developer dashboard for managing projects,
        tasks, and daily workflow in one place.
      </p>
    </div>
  )
}

export default AuthHero