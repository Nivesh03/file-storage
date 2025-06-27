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
import { Doc } from "@/convex/_generated/dataModel"
import { Download, MoreVertical, Star, StarsIcon, Trash2Icon, Undo2Icon } from "lucide-react"
import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import {toast} from "sonner"
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu"
import { Protect } from "@clerk/nextjs"
import { useFileUrl } from "./FileCards"


export const FileCardActions = ({file, isFavourited}: {file: Doc<"files">, isFavourited: boolean}) => {
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