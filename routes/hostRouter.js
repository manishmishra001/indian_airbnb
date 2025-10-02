// External Module
const express = require("express");
const hostRouter = express.Router();

// Local Module
const hostController = require("../controllers/hostController");

hostRouter.get("/add-home", hostController.getAddHome);
hostRouter.post("/add-home", hostController.postAddHome);
hostRouter.get("/host-home-list", hostController.getHostHomes);
hostRouter.get("/edit-home/:homeId", hostController.getEditHome);
hostRouter.post("/edit-home", hostController.postEditHome);
hostRouter.post("/delete-home/:homeId", hostController.postDeleteHome);

module.exports = hostRouter;



// const express = require("express");
// const hostRouter = express.Router();

// // Local Module
// const hostController = require("../controllers/hostController");
// const { uploadFiles } = require('../middleware/upload'); // new middleware

// hostRouter.get("/add-home", hostController.getAddHome);
// hostRouter.post("/add-home", uploadFiles, hostController.postAddHome); // handles both photo & pdf
// hostRouter.get("/host-home-list", hostController.getHostHomes);
// hostRouter.get("/edit-home/:homeId", hostController.getEditHome);
// hostRouter.post("/edit-home", uploadFiles, hostController.postEditHome); // optional for edit
// hostRouter.post("/delete-home/:homeId", hostController.postDeleteHome);

// module.exports = hostRouter;

// // Inside your controller methods, you can now access the files like this:

// const photoFile = req.files && req.files.photo ? req.files.photo[0] : null;
// const pdfFile = req.files && req.files.pdf ? req.files.pdf[0] : null;

// if (!photoFile) {
//   return res.status(400).send('No photo uploaded.');
// }
// // ... use photoFile.path and pdfFile?.path as needed
