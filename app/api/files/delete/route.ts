import { del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fileId, url } = await request.json()

    if (!fileId || !url) {
      return NextResponse.json({ error: "File ID and URL required" }, { status: 400 })
    }

    // Verify file ownership
    const { data: file, error: fetchError } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !file) {
      return NextResponse.json({ error: "File not found or unauthorized" }, { status: 404 })
    }

    // Delete from Vercel Blob
    await del(url)

    // Delete from database
    const { error: dbError } = await supabase.from("files").delete().eq("id", fileId)

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to delete file record" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
