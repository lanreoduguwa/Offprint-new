const express = require("express");
const router  = express.Router();
// CORRECT
const { subscribe, getAllSubscribers, deleteSubscriber } = require("../controllers/newsletterController");

router.post("/",       subscribe);          // POST   /api/newsletter
router.get("/",        getAllSubscribers);   // GET    /api/newsletter
router.delete("/:id",  deleteSubscriber);   // DELETE /api/newsletter/:id

module.exports = router;