import authController from '../controllers/authController.js';

const setAuthRoutes = (router) => {
    router.use('/auth', authController);
}

export default setAuthRoutes;