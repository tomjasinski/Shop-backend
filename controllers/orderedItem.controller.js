const db = require("../models");
const OrderedItem = db.orderedItem;

exports.create = (req, res) => {
  // Validate request
  if (!req.body.name) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create an ordered item
  const orderedItem = new OrderedItem({

              name: req.body.name,
              description: req.body.description,              
              imageURL: req.body.imageURL,
              size: req.body.size,
              color: req.body.color,
              pricePerItem: req.body.pricePerItem,
              orderedQty: req.body.orderedQty,
              orderDate: req.body.orderDate
          },
);

  // Save ordered Item in the database
  orderedItem
    .save(orderedItem)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Item."
      });
    });
};

//Find all ordered items with filters
exports.findAll = (req, res) => {

    const name = req.query.name;
    var condition = name ? { name: { $regex: new RegExp(name), $options: "i" } } : {};
  
    OrderedItem.find(condition)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving tutorials."
        });
      });
    };

// Find an single ordered Item with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  OrderedItem.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Item with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Item with id=" + id });
    });
};
  
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  OrderedItem.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update ordered Item with id=${id}. Maybe Ordered Item was not found!`
        });
      } else res.send({ message: "Ordered Item was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Ordered Item with id=" + id
      });
    });
};


// Delete an ordered Item with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  OrderedItem.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Ordered Item with id=${id}. Maybe Ordered Item was not found!`
        });
      } else {
        res.send({
          message: "Ordered Item was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Ordered Item with id=" + id
      });
    });
};
  
//delete all ordered items
exports.deleteAll = (req, res) => {
    OrderedItem.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} ordered Items were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all ordered items."
      });
    });
};