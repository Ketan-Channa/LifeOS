import { Router } from 'express';
import { NoteController } from '../controllers/note.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJwt);

router.get('/', NoteController.getNotes);
router.get('/:id', NoteController.getNoteById);
router.post('/', NoteController.createNote);
router.patch('/:id', NoteController.updateNote);
router.delete('/:id', NoteController.deleteNote);

export default router;
