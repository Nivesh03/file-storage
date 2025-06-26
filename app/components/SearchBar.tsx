import { Button } from "@/components/ui/button"
import {Form,FormControl,FormField,FormItem,FormLabel,FormMessage,} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { zodResolver } from "@hookform/resolvers/zod"
import { SearchIcon } from "lucide-react"
import { Dispatch, SetStateAction } from "react"
import { useForm } from "react-hook-form"
import z from "zod"

const formSchema = z.object({
  query: z.string().min(0).max(100),
})

const SearchBar = ({query, setQuery}: {query: string, setQuery: Dispatch<SetStateAction<string>>}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",

    },
  })
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setQuery(values.query)
  }
  return (
    <div>
        <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 justify-evenly items-center">
            <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                <FormItem>
                    <FormControl>
                    <Input placeholder="type to search" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            
            <Button size="sm" className="flex gap-1" type="submit" disabled={form.formState.isSubmitting}>
                <SearchIcon />Search
            </Button>
            </form>
        </Form>
    </div>
  )
}

export default SearchBar