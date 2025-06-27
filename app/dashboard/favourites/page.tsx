"use client"

import FileBrowser from '@/app/components/FileBrowser'
import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'

const FavouritesPage = () => {

  return (
    <div>
      <FileBrowser title="Favourites" favouritesOnly/>
    </div>
  )
}

export default FavouritesPage