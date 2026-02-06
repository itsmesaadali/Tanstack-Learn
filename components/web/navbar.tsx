'use client'

import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import { ThemeToggle } from "./theme-toggle";
import { authClient } from "@/lib/auth-client";
import { useSignout} from "@/lib/handle-signout";

export function Navbar() {
    const { data: session, isPending } = authClient.useSession();

    const { handleSignout } = useSignout();

    return (
        <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <img src="/favicon.ico" alt="Next.js Logo"
                    className="w-8 h-8" />
                    <h1 className="text-lg font-bold">Next Scraping</h1>
                </div>

                <div className="flex items-center gap-3">
                    {isPending ? null : session ? (
                        <>
            <Link href="/dashboard" className={buttonVariants({variant: "outline"})}>Dashboard</Link>
                        <Button onClick={handleSignout}>Logout</Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className={buttonVariants({variant: "outline"})}>Login</Link>
                            <Link href="/signup" className={buttonVariants({variant: "default"})}>Get Started</Link>
                        </>
                    )}
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    )
}