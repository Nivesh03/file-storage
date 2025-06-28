"use client";
import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import FileCards from "@/app/components/FileCards";
import Image from "next/image";
import { Grid, Table2 } from "lucide-react";
import SearchBar from "@/app/components/SearchBar";
import { useState } from "react";
import UploadButton from "@/app/components/UploadButton";
import { DataTable } from "./FileTable";
import { columns } from "./Columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Doc } from "@/convex/_generated/dataModel";

function Placeholder() {
  
    return (
    <div className="flex flex-col gap-6 w-full items-center mt-12">
    <Image 
      src="/empty.svg" 
      alt="an image of image directory"
      height={300}
      width={300}
    />
    <div className="text-2xl">Nothing to see here. Start uploading!</div>
    <UploadButton />
    </div>
    )
    
}

export default function FileBrowser({
  title, favouritesOnly, deletedOnly}: 
  {title: string, favouritesOnly?: boolean, deletedOnly?: boolean
  }) {
  const organization = useOrganization()

  const user = useUser()
  const [query, setQuery] = useState("")
  const [type, setType] = useState<Doc<"files">["type"] | "all">("all")

  let orgId: string | undefined = undefined
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id
  }
  const favourites = useQuery(
    api.files.getAllFavourites, 
    orgId ? {orgId} : "skip"
  )
  const files = useQuery(
    api.files.getFiles, 
    orgId ? {orgId,type: type === "all" ? undefined : type, query, favourites: favouritesOnly, deleted: deletedOnly} : "skip"
  )

  const isLoading = files === undefined

  const modifiedFile = files?.map((file) => ({
    ...file,
    isFavourited: (
      (favourites ?? []).some(
        (favourite) => favourite.fileId === file._id
      )
    )
  })) ?? []

  return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{title}</h1>
          <SearchBar query = {query} setQuery = {setQuery}/>
          <UploadButton />
        </div>
        <Tabs defaultValue="grid">
          <div className="flex justify-between items-center">
            <TabsList className="w-[400px]">
              <TabsTrigger value="grid"><Grid/>   Grid</TabsTrigger>
              <TabsTrigger value="table"><Table2/>  Table</TabsTrigger>
            </TabsList>
            <div className="flex gap-2 items-center">
              <Select value={type} onValueChange={(newType) => {
                setType(newType as any)
              }}>
                <SelectTrigger id="type-filter" className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Files</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="pdf">Pdf</SelectItem>
                  <SelectItem value="txt">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {
            isLoading && (
            <div>
              <div className="grid grid-cols-3 gap-4 w-full">
                <Skeleton className="w-50 h-50" />
                <Skeleton className="w-50 h-50"/>
                <Skeleton className="w-50 h-50"/>
              </div>
            </div>
            )
          }
          <TabsContent value="grid">
          <div className="grid grid-cols-3 gap-4">
          {
          modifiedFile?.map((file) => {
            return <FileCards  key={file._id} file={file}/>
          })}
        </div>
          </TabsContent>
          <TabsContent value="table"><DataTable columns={columns} data={modifiedFile} /></TabsContent>
        </Tabs>
        {files && files.length === 0 && <Placeholder/>}
        

      </div>
  );
}
