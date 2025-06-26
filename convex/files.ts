import { ConvexError, v } from "convex/values";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUser } from "./users";
import { fileTypes } from "./schema";

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

async function hasAccessToOrg(ctx: QueryCtx | MutationCtx, tokenIdentifier: string, orgId: string) {
    const user = await getUser(ctx, tokenIdentifier)
    const hasAccess = user.orgIds.includes(orgId) 
        || user.tokenIdentifier.includes(orgId)

    return hasAccess
}

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
        const files = await ctx.db.query("files").withIndex("by_orgId", (q) => q.eq("orgId", args.orgId)).collect()
        const query = args.query
        if (query) {
            return files.filter((file) => 
                file.name.toLowerCase().includes(query.toLowerCase())
            )
        } else {
            return files
        }
        
    }
})

export const deleteFile = mutation({
    args: {
        fileId: v.id("files"),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity()

        if (!identity) {
            throw new ConvexError("you must be logged in")
        }
        const file = await ctx.db.get(args.fileId)
        if (!file) {
            throw new ConvexError("file does not exist")
        }
        const hasAccess = await hasAccessToOrg(
            ctx, identity.tokenIdentifier, file.orgId
        )

        if (!hasAccess) {
            throw new ConvexError("Cannot delete this file (not authorized)")
        }

        await ctx.db.delete(args.fileId)
    },
})