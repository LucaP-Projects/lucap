export default function AuthLayout({
    children,
    }: {
    children: React.ReactNode
    }) {
    return (
        <div className="flex min-h-svh w-full">
            {children}
        </div>
    )
}