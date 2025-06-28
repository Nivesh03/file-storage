import { Button } from "@/components/ui/button"
import { OrganizationSwitcher, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"

const Header = () => {
  return (
    <header className=" relative border-b py-4" style={{
        backgroundColor: "rgb(255, 250, 239)"
    }}>
        <div className="container mx-10 flex justify-between items-center">
            <Link href={"/"} className="flex items-center">
                <Image src="/logo.png" alt="logo" width={80} height={80}/>
                <Image src="/name.png" alt="name" width={100} height={60} className="mt-5"/>
            </Link>
            <div className="flex gap-2">
                <OrganizationSwitcher/>
                <UserButton />
                <SignedOut>
                    <SignInButton>
                        <Button>
                            Sign In
                        </Button>
                    </SignInButton>
                </SignedOut>
            </div>
        </div>
    </header>
  )
}

export default Header