import express from 'express';
import Dockable, { File } from '../dockable/dockable';

const router = express.Router();

router.post('/execute', (req, res) => {
  const { root, stdin, files }: {root: string, stdin:string, files: File[]} = req.body;
  const callbackContainer = {
    callback: (stdout: string, stderr: string, executionTime: string) => {
      res.status(200).send({
        "stdout": stdout,
        "stderr": stderr,
        "execution-time": executionTime
      });
    }
  } 
  const dockable = new Dockable(root, stdin, files, callbackContainer);
  dockable.execute();
});

export default router;