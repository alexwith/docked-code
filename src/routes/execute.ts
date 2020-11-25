import express from 'express';

import { File } from '../utils/interfaces';

import Dockable from '../dockable/dockable';

const router = express.Router();

router.post('/execute', (req, res) => {
  const { root, stdin, files }: {root: string, stdin: string, files: File[]} = req.body;
  const resolver = {
  resolve: (stdout: string, stderr: string, executionTime: string, startTime: string, information: string) => {
    res.status(200).send({
        "stdout": stdout,
        "stderr": stderr,
        "execution-time": executionTime,
        "total-time": startTime,
        "information": information
      });
    }
  } 
  const dockable = new Dockable(root, stdin, files, resolver);
  dockable.execute();
});

export default router;