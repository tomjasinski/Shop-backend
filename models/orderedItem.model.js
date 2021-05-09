module.exports = mongoose => {
    var schema = mongoose.Schema(
            {
                
                      name: String,
                      description: String,
                      imageURL: String,
                      size: String,
                      color: String,
                      pricePerItem: Number,
                      orderedQty: Number,
                      orderDate: Date
                
            },
             { timestamps: true }


            )
    
    schema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
      });
    
    const OrderedItem = mongoose.model("orderedItem", schema);

    return OrderedItem;
}