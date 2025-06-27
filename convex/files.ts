import { ConvexError, v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUser } from "./users";
import { fileTypes } from "./schema";
import { Id } from "./_generated/dataModel";

async function hasAccessToOrg(ctx: QueryCtx | MutationCtx, tokenIdentifier: string, orgId: string) {
    const user = await getUser(ctx, tokenIdentifier)
    const hasAccess = user.orgIds.includes(orgId) 
        || user.tokenIdentifier.includes(orgId)

    return hasAccess
}

async function hasAccesToFile(ctx: QueryCtx | MutationCtx, fileId: Id<"files">) {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
        return null
    }
    const file = await ctx.db.get(fileId)
    if (!file) {
        return null
    }
    const hasAccess = await hasAccessToOrg(
        ctx, identity.tokenIdentifier, file.orgId
    )

    if (!hasAccess) {
        return null
    }
    const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", 
        q => q.eq("tokenIdentifier", identity.tokenIdentifier)
    ).first()

    if (!user) {
        return null
    }

    return { user, file }
}

export const getFileUrl = query({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new ConvexError("File not found");
    }

    const user = await getUser(ctx, identity.tokenIdentifier);
    const hasAccess =
      user.orgIds.includes(file.orgId) ||
      identity.tokenIdentifier.includes(file.orgId);

    if (!hasAccess) {
      throw new ConvexError("Unauthorized to access this file");
    }

    const url = await ctx.storage.getUrl(file.fileId); // file.fileId is Id<"_storage">
    return url;
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
        throw new ConvexError("you must be logged in")
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const toggleFavourite = mutation({
        args: {
        fileId: v.id("files"),
    },
    async handler(ctx, args) {
        const access = await hasAccesToFile(ctx, args.fileId)

        if (!access) {
            throw new ConvexError("No access to file")
        }

        const favourite = await ctx.db.query("favourites").withIndex("by_userId_orgId_fileId", q => 
            q.eq("userId", access.user._id).eq("orgId", access.file.orgId).eq("fileId", access.file._id)
        ).first()
        
        if (!favourite) {
            await ctx.db.insert("favourites", {
                fileId: access.file._id,
                orgId: access.file.orgId,
                userId: access.user._id,         
            })
        } else {
            await ctx.db.delete(favourite._id)
        }
    },
})




export const createFile = mutation({
    args: {
        name: v.string(),
        fileId: v.id("_storage"),
        orgId: v.string(),
        type: fileTypes,
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity()

        if (!identity) {
            throw new ConvexError("you must be logged in")
        }

        const hasAccess = await hasAccessToOrg(
            ctx, identity.tokenIdentifier, args.orgId
        )

        if (!hasAccess) {
            throw new ConvexError("not authorized with this org")
        }

        await ctx.db.insert("files", {
            name: args.name,
            orgId: args.orgId,
            fileId: args.fileId,
            type: args.type,
        })
    }
})

export const getFiles = query({
    args: {
        orgId: v.string(),
        query: v.optional(v.string()),
        favourites: v.optional(v.boolean()),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity()
        if(!identity) {
            return []
        }
       const hasAccess = await hasAccessToOrg(
        ctx, identity.tokenIdentifier, args.orgId
        )

        if (!hasAccess) {
            return []
        }
        let files = await ctx.db.query("files").withIndex("by_orgId", (q) => q.eq("orgId", args.orgId)).collect()
        const query = args.query
        if (query) {
            files =  files.filter((file) => 
                file.name.toLowerCase().includes(query.toLowerCase())
            )
        }
        if (args.favourites) {
            const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", 
                q => q.eq("tokenIdentifier", identity.tokenIdentifier)
            ).first()
            if (!user) {
                return files
            }

            const favourites = await ctx.db.query("favourites").withIndex("by_userId_orgId_fileId",
                q => q.eq("userId",user._id).eq("orgId", args.orgId)
            ).collect()

            files = files.filter(
                (file) => favourites.some(
                    (favourite) => favourite.fileId === file._id
                )
            )
        }
        return files
    }
})

export const deleteFile = mutation({
    args: {
        fileId: v.id("files"),
    },
    async handler(ctx, args) {
        const access = await hasAccesToFile(ctx, args.fileId)

        if (!access) {
            throw new ConvexError("No access to file")
        }

        await ctx.db.delete(args.fileId)
    },
})