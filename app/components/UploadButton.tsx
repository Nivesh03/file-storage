"use client";

import { Button, } from "@/components/ui/button";
import {Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1).max(100),
  file: z.custom<FileList>((val) => val instanceof FileList, "Required")
  .refine((files) => files.length > 0, "Required"),
})

export default function Home() {
  const organization = useOrganization()
  const user = useUser()
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  })
  let orgId: string | undefined = undefined
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id
  }
  
  const fileRef = form.register("file")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    console.log(values.file)
    if (!orgId) return
    const postUrl = await generateUploadUrl();

    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": values.file[0].type },
      body: values.file[0],
    });
    const { storageId } = await result.json();
    try {
      await createFile({
        name: values.title,
        fileId: storageId,
        orgId,
    })

    toast.success("File Upload Succesful", {
      description: "File was added successfully to your account",
    })
    } catch (error) {
      toast.error("Error", {
        description: "Something went wrong. Try again later",
      })
      console.log(error)
    }

    setIsDialogOpen(false)

  }

 

  const createFile = useMutation(api.files.createFile)
  return (
        <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen)
          form.reset()
        }}>
          <DialogTrigger asChild>
            <Button className="hover:cursor-pointer" onClick={() => {
                
              }}
            >
              Upload File
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mb-8">Upload Here</DialogTitle>
              <DialogDescription>
                Files uploaded will only be accessible by the uploader or within the org
              </DialogDescription>
            </DialogHeader>
            <div>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input type="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="file"
                      render={() => (
                        <FormItem>
                          <FormLabel>File</FormLabel>
                          <FormControl>
                            <Input 
                              type="file" {...fileRef} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button className="flex gap-1" type="submit" disabled={form.formState.isSubmitting}>
                      {
                      form.formState.isSubmitting &&
                        (<Loader2 className="h-4 w-4 animate-spin"/>)
                      }
                      Submit
                    </Button>
                  </form>
                </Form>
            </div>
          </DialogContent>
        </Dialog>
  );
}
