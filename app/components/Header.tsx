import { Button } from "@/components/ui/button"
import { OrganizationSwitcher, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"

const Header = () => {
  return (
    <div className="border-b py-4 bg-gray-50">
        <div className="container mx-auto flex justify-between items-center">
            <div>FileDrive</div>
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
    </div>
  )
}

export default Header