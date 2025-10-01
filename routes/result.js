import resultController from '../controllers/resultController.js';

const setResultRoutes = (router) => {
    router.use('/cv', resultController);
}

export default setResultRoutes;