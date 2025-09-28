import uploadCVController from '../controllers/uploadCVController.js';

const setUploadRoutes = (router) => {
    router.use('/cv', uploadCVController);
}

export default setUploadRoutes;