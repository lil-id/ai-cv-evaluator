import jobController from '../controllers/jobController.js';

const setJobRoutes = (router) => {
    router.use('/jobs', jobController);
}

export default setJobRoutes;