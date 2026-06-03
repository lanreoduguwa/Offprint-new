const express = require("express");
const router  = express.Router();

const {
  subscribe,
  getAllSubscribers,
  deleteSubscriber,
} = require("../controller/newslettercontroller");

router.post("/",       subscribe);          // POST   /api/newsletter
router.get("/",        getAllSubscribers);   // GET    /api/newsletter
router.delete("/:id",  deleteSubscriber);   // DELETE /api/newsletter/:id

module.exports = router;