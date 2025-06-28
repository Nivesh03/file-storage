import Image from "next/image"
import Link from "next/link"

const Footer = () => {
  return (
    <footer className="relative z-10 border-t" style={{
        backgroundColor: "rgb(255, 250, 239)",
    }}> 
        <div className=" mt-2 flex items-center justify-center">
            <Image src={"/name.png"} alt="name" width={80} height={80} />
        </div>
        <div className="container mx-auto flex flex-col gap-1 justify-evenly items-center">
            
            <Link className="text-blue-400 hover:underline" href="/privacy">Privacy</Link>
            <Link className="text-blue-400 hover:underline" href="/terms-of-service">Terms of Service</Link>
            <Link className="text-blue-400 hover:underline" href="/about">About</Link>
        </div>
    </footer>
  )
}

export default Footer