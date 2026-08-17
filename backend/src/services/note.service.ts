import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NoteService {
  static async getNotes(userId: string) {
    return prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });
  }

  static async getNoteById(userId: string, noteId: string) {
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note || note.userId !== userId) {
      throw new Error('Note not found');
    }
    return note;
  }

  static async createNote(userId: string, data: any) {
    return prisma.note.create({
      data: {
        ...data,
        userId
      }
    });
  }

  static async updateNote(userId: string, noteId: string, data: any) {
    await this.getNoteById(userId, noteId);
    return prisma.note.update({
      where: { id: noteId },
      data
    });
  }

  static async deleteNote(userId: string, noteId: string) {
    await this.getNoteById(userId, noteId);
    return prisma.note.delete({
      where: { id: noteId }
    });
  }
}
