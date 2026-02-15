import Image from "next/image";
import { Icon } from "@iconify/react";

export function AvatarUser () {
    return (
        <section>
            <div className=" h-68 rounded-full bg-amber-200 relative">
                <Image
                    src="confirm.svg"
                    alt="avatar"
                    width={100}
                    height={100}
                    className="object-cover absolute"
                />
            </div>
        </section>
    )
}