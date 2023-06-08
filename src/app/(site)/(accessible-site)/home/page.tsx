"use client";

import { useSession } from "next-auth/react";

export default function HomePage() {
    const user = useSession();

    return (
        <div>
            <h1>Welcome back, <span className="text-primary">{user.data?.user?.username || "Unknown"}</span></h1>
            <h3 className="font-light text-2xl text-neutral-300 tracking-wider">Let&apos;s get to work</h3>
            <div className="flex flex-col gap-8">

            </div>
        </div>
    );
}