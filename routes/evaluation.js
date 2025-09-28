import evaluationCVController from '../controllers/evaluationCVController.js';

const setEvalutionRoutes = (router) => {
    router.use('/cv', evaluationCVController);
}

export default setEvalutionRoutes;