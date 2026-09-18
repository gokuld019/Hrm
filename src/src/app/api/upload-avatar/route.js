// Place this file at: app/api/upload-avatar/route.js

import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync }               from "fs";
import path                         from "path";
import { NextResponse }             from "next/server";

export async function POST(request) {
  try {
    const formData  = await request.formData();
    const file      = formData.get("file");
    const employeeId = formData.get("employee_id"); // e.g. "EMP001"

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!employeeId || !employeeId.trim()) {
      return NextResponse.json({ error: "employee_id is required to name the file" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, WebP, GIF allowed." }, { status: 400 });
    }

    // Validate file size (4 MB max)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 4 MB." }, { status: 400 });
    }

    // Sanitize employee_id for use as filename (remove special chars except dash/underscore)
    const safeId = employeeId.trim().replace(/[^a-zA-Z0-9\-_]/g, "_");
    const ext    = file.name.split(".").pop().toLowerCase();

    // Filename = employee ID, e.g. "EMP001.jpg" or "EMP-001.png"
    const filename = `${safeId}.${ext}`;

    // Ensure /public/avatars/ exists
    const avatarsDir = path.join(process.cwd(), "public", "avatars");
    if (!existsSync(avatarsDir)) {
      await mkdir(avatarsDir, { recursive: true });
    }

    // Delete old avatar for this employee if it exists (any extension)
    const extensions = ["jpg", "jpeg", "png", "webp", "gif"];
    for (const oldExt of extensions) {
      const oldPath = path.join(avatarsDir, `${safeId}.${oldExt}`);
      if (existsSync(oldPath)) {
        await unlink(oldPath).catch(() => {}); // silent fail
      }
    }

    // Write new file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(avatarsDir, filename), buffer);

    // Return the public-accessible path
    return NextResponse.json({ path: `/avatars/${filename}` }, { status: 200 });

  } catch (err) {
    console.error("Avatar upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}