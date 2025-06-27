import { format, formatDistance, formatRelative, subDays } from 'date-fns'
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
import { Download, FileIcon, FileTextIcon, ImageIcon, MoreVertical, Star, StarsIcon, Trash2Icon, Undo2Icon } from "lucide-react"
import { ReactNode, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import {toast} from "sonner"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu"
import { Protect } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function useFileUrl(fileId: Id<"files"> | undefined) {
  const url = useQuery(api.files.getFileUrl, fileId ? { fileId } : "skip");
  return url;
}

const FileCardActions = ({file, isFavourited}: {file: Doc<"files">, isFavourited: boolean}) => {
    const deleteFile = useMutation(api.files.deleteFile)
    const restoreFile = useMutation(api.files.restoreFile)
    const toggleFavourite = useMutation(api.files.toggleFavourite)
  const url = useFileUrl(file._id)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    return (
        <>
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    Files will be moved to Trash. Trashed files are deleted in 1 day.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={ async () => {
                    try {
                        await deleteFile({
                            fileId: file._id
                        })
                        toast.success("File moved to trash.",
                          {
                            description: "File will be deleted in 10 days"
                          }
                        )
                    } catch (error) {
                        toast.error("Moving to trash failed. Try again later.")
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
                    {
                    isFavourited ? 
                    <div className="flex items-center gap-2"><Star/>Unfavourite</div> : 
                    <div className="flex items-center gap-2"><StarsIcon/>Favourite</div>}
                    
                </DropdownMenuItem>

                <DropdownMenuSeparator/>

                <DropdownMenuItem 
                    onClick={() => {
                    
                    if (url) {
                      window.open(url, "_blank");
                    } else {
                      toast.warning("File URL is still loading.");
                    }
                  }}
                    className="flex gap-2 items-center cursor-pointer hover:font-bold"
                >
                    <Download/>Download
                    
                </DropdownMenuItem>

                <DropdownMenuSeparator/>

                <Protect
                  role="org:admin"
                  fallback={<></>}
                >
                    <DropdownMenuItem 
                        onClick={async () => {
                            try {
                              if (file.shouldDelete) {
                                await restoreFile({
                                  fileId: file._id,
                                })
                                toast.success("File restored successfully .")
                              } else {
                                setIsConfirmOpen(true)
                              }
                              
                            } catch (error) {
                              toast.error("Restoring file from trash failed. Try again later.")
                            }
                        }}
                        className="cursor-pointer hover:font-bold"
                    >   
                        { 
                        file.shouldDelete ? 
                        <div className="flex gap-2 text-green-600 items-center "><Undo2Icon/>Restore</div> :
                        <div className="flex gap-2 text-red-600 items-center "><Trash2Icon/>Trash</div>
                        }
                        
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
  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  })
  const url = useFileUrl(file._id);
  const isFavourited = favourites.some(favourite => favourite.fileId === file._id)
  
  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2 items-center text-base ">
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

      <CardFooter className="flex items-center justify-evenly">
        <div className="flex justify-center items-center gap-1 text-xs w-40">
          <Avatar className="h-6 w-6" >
            <AvatarImage src={userProfile?.image} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>{userProfile?.name}</div>
        </div>
        <div className="flex flex-col items-center gap-1 text-xs w-40">
          <div className='font-bold'>Created on:</div>
          <div className='capitalize'>{formatRelative(new Date(file._creationTime), new Date())}</div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FileCards;