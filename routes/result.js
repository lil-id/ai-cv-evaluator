import resultCVController from '../controllers/resultCVController.js';

const setResultRoutes = (router) => {
    router.use('/cv', resultCVController);
}

export default setResultRoutes;