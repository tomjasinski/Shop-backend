const db = require("../models");
const Item = db.items;

exports.create = (req, res) => {
  // Validate request
  if (!req.body.name) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create an item
  const item = new Item({

              name: req.body.name,
              description: req.body.description,              
              imageURL: req.body.imageURL,
              size: req.body.size,
              color: req.body.color,
              price: req.body.price,
              starRating: req.body.starRating,
              category: req.body.category,
              availableQty: req.body.availableQty
          },
);

  // Save Item in the database
  item
    .save(item)
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

//Find all items with filters
exports.findAll = (req, res) => {

  const { name, category, size, price_from, price_to, color, starRating, sort} = req.query;
  let query = {};

  if(name) {
    query.name = { $regex: new RegExp(name), $options: "i" }
  }

  if(category){

    const categories = category.split(',');
    query.category = categories;
  }

  if(size) {
   
    const sizes = size.split(',');
    query.size = sizes;
  }

  if(price_from || price_to){

    if(price_from && price_to){
      query.price = {$gt: price_from, $lt: price_to};
    }
    else if (price_from){
      
      query.price = {$gt: price_from};
    }
    else{

      query.price = {$lt: price_to};
    }
  }

  if(color){

    const colors = color.split(',');
    for(var i=0; i < colors.length; i++){
      colors[i] = "#" + colors[i];
  }
    query.color = colors;
  }

  if(starRating){
    query.starRating = {$gt: starRating};
  }

  //sorting params
  let sort_param = {};

  if(sort){
    sort_param = {price: sort};
  }
  else{
    sort_param = {createdAt: 'desc'};
  }

    Item.find(query).sort(sort_param)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving items. "
        });
      });
  };

// Find an single Item with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Item.findById(id)
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

  Item.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Item with id=${id}. Maybe Item was not found!`
        });
      } else res.send({ message: "Item was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Item with id=" + id
      });
    });
};


// Delete an Item with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Item.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Item with id=${id}. Maybe Item was not found!`
        });
      } else {
        res.send({
          message: "Item was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Item with id=" + id
      });
    });
};
  
//delete all items
exports.deleteAll = (req, res) => {
  Item.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Items were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all items."
      });
    });
};

//get available categories
exports.categories = (req, res) => {
  
  Item.distinct("category")
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving categories. "
      });
    });  
};



