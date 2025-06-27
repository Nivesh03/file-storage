"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { ColumnDef } from "@tanstack/react-table"
import { useQuery } from "convex/react"
import { formatRelative } from "date-fns"
import { FileCardActions } from "./FileActions"


export const columns: ColumnDef<Doc<"files"> & { isFavourited: boolean}>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },

  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
        const userProfile = useQuery(api.users.getUserProfile, {
            userId: row.original.userId
        })
    return (
        <div>
        <div className="flex justify-center items-center gap-1 text-xs w-40">
          <Avatar className="h-6 w-6" >
            <AvatarImage src={userProfile?.image} />
            <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>{userProfile?.name}</div>
            </div>
        </div>
    )
    
    },
   },

  {
    accessorKey: "createdOn",
    header: "Created On",
    cell: ({ row }) => {
      return <div>{formatRelative(new Date(row.original._creationTime), new Date())}</div>
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
        return (
        <div>
         <FileCardActions file={row.original} isFavourited={row.original.isFavourited}/>
        </div>)
    }
  },
  
]