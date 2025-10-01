import uploadController from '../controllers/uploadController.js';

const setUploadRoutes = (router) => {
    router.use('/cv', uploadController);
}

export default setUploadRoutes;