import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const fileTypes = v.union(v.literal("image"), v.literal("txt"), v.literal("pdf"))
export const roles = v.union(v.literal("admin"), v.literal("guest_member"), v.literal("basic_member"))
export default defineSchema({
  files: defineTable({ 
    name: v.string(), 
    type: fileTypes,
    fileId: v.id("_storage"),
    userId: v.id("users"),
    orgId: v.string(), 
    shouldDelete: v.optional(v.boolean()),
    
  }).index("by_orgId", ["orgId"])
  .index("by_shouldDelete", ["shouldDelete"]),

  favourites: defineTable({
    fileId: v.id("files"),
    orgId: v.string(),
    userId: v.id("users"),
  }).index("by_userId_orgId_fileId", ["userId", "orgId", "fileId"]),

  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    orgIds: v.array(v.object({
      orgId: v.string(),
      role: roles,
    })),
  }).index("by_tokenIdentifier", ["tokenIdentifier"])
})