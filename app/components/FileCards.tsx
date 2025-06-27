import {formatRelative } from 'date-fns'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Doc, Id } from "@/convex/_generated/dataModel"
import {FileIcon, FileTextIcon, ImageIcon } from "lucide-react"
import { ReactNode } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileCardActions } from './FileActions'

export function useFileUrl(fileId: Id<"files"> | undefined) {
  const url = useQuery(api.files.getFileUrl, fileId ? { fileId } : "skip");
  return url;
}

const FileCards = ({ file }: { 
  file: Doc<"files"> & { isFavourited: boolean}
}) => {
  const typeToIcons = {
    image: <ImageIcon />,
    pdf: <FileIcon />,
    txt: <FileTextIcon />,
  } as Record<Doc<"files">["type"], ReactNode>;
  const userProfile = useQuery(api.users.getUserProfile, {
    userId: file.userId,
  })
  const url = useFileUrl(file._id);
  
  return (
    <Card>
      <CardHeader className="relative">
        <CardTitle className="flex gap-2 items-center text-base ">
          <div>{typeToIcons[file.type]}</div>
          {file.name}
        </CardTitle>
        <div className="absolute top-0 right-2">
          <FileCardActions isFavourited={file.isFavourited} file={file} />
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
            <Skeleton className="h-30 w-30"/>
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