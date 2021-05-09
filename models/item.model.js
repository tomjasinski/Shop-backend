module.exports = mongoose => {
    var schema = mongoose.Schema(
            {
                
                      name: String,
                      description: String,
                      imageURL: String,
                      size: String,
                      color: String,
                      price: Number,
                      starRating: Number,
                      category: String,
                      availableQty: Number                   
                
            },
             { timestamps: true }


            )
    
    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
      });
    
    const Item = mongoose.model("item", schema);

    return Item;
}