import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Récupérer tous les utilisateurs (GET)
export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la récupération des utilisateurs" }, { status: 500 });
  }
}

// Ajouter un utilisateur (POST)
export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();
    const newUser = await prisma.user.create({
      data: { name, email },
    });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de l'ajout de l'utilisateur" }, { status: 500 });
  }
}


// Supprimer un utilisateur (DELETE)
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Utilisateur supprimé" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}