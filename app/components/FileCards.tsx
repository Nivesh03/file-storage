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
import { Doc } from "@/convex/_generated/dataModel"
import { MoreVertical, Trash2Icon, TrashIcon } from "lucide-react"
import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import {toast} from "sonner"

const FileCardActions = ({file}: {file: Doc<"files">}) => {
    const deleteFile = useMutation(api.files.deleteFile)
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
                        setIsConfirmOpen(true)
                    }}
                    className="flex gap-1 text-red-600 items-center cursor-pointer"
                >
                    <Trash2Icon className="text-red-600 h-3 w-3"/>
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        </>
    )
}

const FileCards = ({file}: {file:Doc<"files">}) => {
  return (
    <Card>
        <CardHeader className="relative">
            <CardTitle>{file.name}</CardTitle>
            <div className="absolute top-0 right-2">
                <FileCardActions file = {file}/>
            </div>
        </CardHeader>
        <CardContent>
            <p>Card Content</p>
        </CardContent>
        <CardFooter className="flex gap-2 justify-center items-center">
            <Button >Download</Button>
        </CardFooter>
    </Card>
  )
}

export default FileCards