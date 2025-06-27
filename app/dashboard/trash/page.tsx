"use client"

import FileBrowser from '@/app/components/FileBrowser'
import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'

const TrashPage = () => {

  return (
    <div>
      <FileBrowser title="Trash" deletedOnly/>
    </div>
  )
}

export default TrashPage