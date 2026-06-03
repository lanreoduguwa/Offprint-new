const express = require("express");
const router  = express.Router();

const { submitContact, getAllContacts, deleteContact } = require("../controllers/contactController");

router.post("/",        submitContact);   // POST   /api/contact
router.get("/",         getAllContacts);  // GET    /api/contact
router.delete("/:id",   deleteContact);  // DELETE /api/contact/:id

module.exports = router;