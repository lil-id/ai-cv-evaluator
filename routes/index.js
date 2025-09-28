import { Router } from 'express';
import setUploadRoutes from './upload.js';
import setEvalutionRoutes from './evaluation.js';

const routes = (app) => {
    const v1 = Router();

    v1.use('/v1', v1)
    setUploadRoutes(v1);
    setEvalutionRoutes(v1);

    app.use('/api', v1);
}

export default routes;