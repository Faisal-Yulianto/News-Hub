import { AvatarUser } from "@/components/profile/avatar-user"

export default function Profile() {
    return (
        <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white font-sans py-10 mt-25 lg:mt-40 md:mt-30">
            <div className="w-[65%] mx-auto dark:bg-[#1a1a1a] dark:text-white p-8 rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
            <div className="w-[50%] m-auto">
                <AvatarUser/>         
            </div>
            </div>
        </main>
    )
}