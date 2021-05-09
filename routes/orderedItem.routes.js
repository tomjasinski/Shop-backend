module.exports = app => {
    const orderedItem = require("../controllers/orderedItem.controller.js");
  
    var router = require("express").Router();
  
    // Create a new orderedItem
    router.post("/", orderedItem.create);
  
    // Retrieve all orderedItem
    router.get("/", orderedItem.findAll);
  
    // Retrieve a single orderedItem with id
    router.get("/:id", orderedItem.findOne);
  
    // Update a orderedItem with id
    router.put("/:id", orderedItem.update);
  
    // Delete a orderedItem with id
    router.delete("/:id", orderedItem.delete);
  
    // Delete all orderedItems
    router.delete("/", orderedItem.deleteAll);
  
    app.use('/api/orderedItem', router);
  };
  