"use client"

import FileBrowser from '@/app/components/FileBrowser'
import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'

const FavouritesPage = () => {

  return (
    <div>
      <FileBrowser title="Favourites" favourites/>
    </div>
  )
}

export default FavouritesPage