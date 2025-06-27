"use client";
import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import FileCards from "@/app/components/FileCards";
import Image from "next/image";
import { FileIcon, Loader2, Star } from "lucide-react";
import SearchBar from "@/app/components/SearchBar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import UploadButton from "@/app/components/UploadButton";

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

export default function FileBrowser({title, favouritesOnly}: {title: string, favouritesOnly?: boolean}) {
  const organization = useOrganization()

  const user = useUser()
  const [query, setQuery] = useState("")

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
    orgId ? {orgId, query, favourites: favouritesOnly} : "skip"
  )

  const isLoading = files === undefined

  return (
    <main className="container mx-5 ">
        {
          isLoading && (
            <div className="flex flex-col gap-8 w-full items-center mt-24">
              <Loader2 className="h-32 w-32 animate-spin text-gray-600" />
              <div className="text-2xl text-gray-600">Loading your files</div>
            </div>
          )
        }

        {
          !isLoading && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">{title}</h1>
                <SearchBar query = {query} setQuery = {setQuery}/>
                <UploadButton />
              </div>
              {files && files.length === 0 && <Placeholder/>}
              <div className="grid grid-cols-3 gap-4">
                {
                files?.map((file) => {
                  return <FileCards favourites={favourites ?? []} key={file._id} file={file}/>
                })}
              </div>
            </div>
          )
        }
    </main>
  );
}
