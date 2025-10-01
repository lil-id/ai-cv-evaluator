import evaluationController from '../controllers/evaluationController.js';

const setEvalutionRoutes = (router) => {
    router.use('/cv', evaluationController);
}

export default setEvalutionRoutes;