import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Doc, Id } from "@/convex/_generated/dataModel"
import { FileIcon, FileTextIcon, ImageIcon, MoreVertical, Star, StarsIcon, Trash2Icon } from "lucide-react"
import { ReactNode, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import {toast} from "sonner"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu"
import { Protect } from "@clerk/nextjs"

function useFileUrl(fileId: Id<"files"> | undefined) {
  const url = useQuery(api.files.getFileUrl, fileId ? { fileId } : "skip");
  return url;
}

const FileCardActions = ({file, isFavourited}: {file: Doc<"files">, isFavourited: boolean}) => {
    const deleteFile = useMutation(api.files.deleteFile)
    const toggleFavourite = useMutation(api.files.toggleFavourite)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    return (
        <>
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the file.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={ async () => {
                    try {
                        await deleteFile({
                            fileId: file._id
                        })
                        toast.success("File deleted successfully.")
                    } catch (error) {
                        toast.error("Deletion failed. Try again later.")
                    }
                    
                    
                }}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <DropdownMenu>
            <DropdownMenuTrigger><MoreVertical className="h-4 w-4"/></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem 
                    onClick={() => {
                        toggleFavourite({
                          fileId: file._id
                        })
                    }}
                    className="flex gap-2 items-center cursor-pointer hover:font-bold"
                >
                    {isFavourited ? <div className="flex items-center gap-2"><Star/>Unfavourite</div> : <div className="flex items-center gap-2"><StarsIcon/>Favourite</div>}
                    
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <Protect
                      role="org:admin"
                      fallback={<></>}
                >
                    <DropdownMenuItem 
                        onClick={() => {
                            setIsConfirmOpen(true)
                        }}
                        className="flex gap-2 text-red-600 items-center cursor-pointer hover:font-bold"
                    >
                        <Trash2Icon className="text-red-600 h-3 w-3 hover:black"/>
                        Delete
                    </DropdownMenuItem>
                </Protect>
                
            </DropdownMenuContent>
        </DropdownMenu>
        </>
    )
}

const FileCards = ({ file, favourites }: { file: Doc<"files">, favourites:Doc<"favourites">[] }) => {
  const typeToIcons = {
    image: <ImageIcon />,
    pdf: <FileIcon />,
    txt: <FileTextIcon />,
  } as Record<Doc<"files">["type"], ReactNode>;
  
  const url = useFileUrl(file._id);
  const isFavourited = favourites.some(favourite => favourite.fileId === file._id)
  
  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2 items-center">
          <div>{typeToIcons[file.type]}</div>
          {file.name}
        </CardTitle>
        <div className="absolute top-0 right-2">
          <FileCardActions isFavourited={isFavourited} file={file} />
        </div>
      </CardHeader>

      <CardContent className="h-[200px] flex justify-center items-center">
        {file.type === "image" ? (
          url ? (
            <Image
              alt={file.name}
              width={200}
              height={100}
              src={url}
              unoptimized // optional, avoids Next.js optimization issues
            />
          ) : (
            <Skeleton className="h-20 w-20"/>
          )
        ) : file.type === "txt" ? (
          <FileTextIcon className="h-20 w-20" />
        ) : (
          <FileIcon className="h-20 w-20" />
        )}
      </CardContent>

      <CardFooter className="flex justify-center items-center">
        <Button
          onClick={() => {
            if (url) {
              window.open(url, "_blank");
            } else {
              toast.warning("File URL is still loading.");
            }
          }}
        >
          Download
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileCards;