import { Router } from 'express';
import setJobRoutes from './job.js';
import setAuthRoutes from './auth.js';
import setUploadRoutes from './upload.js';
import setResultRoutes from './result.js';
import setRubricRoutes from './rubric.js';
import setEvalutionRoutes from './evaluation.js';

const routes = (app) => {
    const v1 = Router();

    v1.use('/v1', v1)
    setUploadRoutes(v1);
    setEvalutionRoutes(v1);
    setResultRoutes(v1);
    setJobRoutes(v1);
    setRubricRoutes(v1);
    setAuthRoutes(v1);

    app.use('/api', v1);
}

export default routes;