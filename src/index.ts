import express from 'express';

import codeRouter from './routes/execute';

const main = async () => {
  const app = express();
  const port = process.env.PORT || 3001;

  app.use(express.json());

  app.use(codeRouter);

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

main();