import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = await context.params;
    const projectId = params.id;

    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Créer un nom de fichier unique
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}-${file.name}`;
    
    // Créer le chemin du dossier pour ce projet
    const projectUploadsDir = join(process.cwd(), 'public', 'uploads', projectId);
    
    // Créer le dossier s'il n'existe pas
    await createDirIfNotExists(projectUploadsDir);
    
    // Chemin complet du fichier
    const filePath = join(projectUploadsDir, fileName);
    
    // Sauvegarder le fichier
    await writeFile(filePath, buffer);
    
    // Retourner l'URL relative pour accéder à l'image
    const imageUrl = `/uploads/${projectId}/${fileName}`;
    
    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function createDirIfNotExists(dir: string) {
  try {
    await writeFile(dir, '', { flag: 'wx' });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EISDIR') {
      // Le dossier existe déjà, c'est ok
      return;
    }
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Le dossier parent n'existe pas, on le crée récursivement
      const parentDir = join(dir, '..');
      await createDirIfNotExists(parentDir);
      await writeFile(dir, '', { flag: 'wx' });
      return;
    }
    throw error;
  }
} 