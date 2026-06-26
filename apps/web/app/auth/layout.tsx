import Image from "next/image"
import AuthBackgroundShape from "@/assets/svg/auth-background-shape"
import Logo from "@/assets/svg/logo"
import { Card, CardContent } from "@/components/ui/card"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-svh w-full lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <div className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-secondary text-primary-foreground">
              <Logo className="size-4" />
            </div>
            LucaP
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-lg">
            <div className='relative flex h-auto  items-center justify-center  px-4 py-10 sm:px-6 lg:px-8'>
              <div className='absolute'>
                <AuthBackgroundShape />
              </div>
              <Card className='z-1 w-full gap-6 py-6 sm:max-w-lg'>
                <CardContent className='px-6'>
                  {children}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/auth-bg.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          width={1920}
          height={1080}
          priority
        />
      </div>
    </div>
  )
}