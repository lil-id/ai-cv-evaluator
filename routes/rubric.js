import rubricController from '../controllers/rubricController.js';

const setRubricRoutes = (router) => {
    router.use('/rubrics', rubricController);
}

export default setRubricRoutes;