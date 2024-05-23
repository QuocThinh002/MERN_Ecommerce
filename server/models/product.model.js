const mongoose = require('mongoose');
const { Schema } = mongoose;


const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [3, 'Product name must be at least 3 characters long'],
        maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: 'Brand',
        required: [true, 'Product brand is required'],
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Product category is required'],
    },
    // seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }], // array tags (ex: "new", "sale", "popular")
    sku: { // product code (SKU - Stock Keeping Unit)
        type: String,
        unique: true,
        sparse: true, // allow null or not exist
        trim: true,
    },
    images: [{
        url: { type: String, required: true },
        publicId: { type: String, required: true }
    }], // Public ID of image Cloudinary or other service
    variants: [
        {
            sku: { type: String, unique: true, sparse: true, trim: true },
            color: { type: String, trim: true },
            size: { type: String, trim: true },
            price: { type: Number, required: true, min: 0 },
            inventory: { type: Number, required: true, min: 0 },
            images: [{
                url: { type: String, required: true },
                publicId: { type: String, required: true }
            }], // publicId: "ao-thun-nam-blue-l
        }
    ],
    ratingsAverage: {
        type: Number,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: (val) => Math.round(val * 10) / 10, // round to decimal place
    },
    ratingsQuantity: { // Số lượng đánh giá cho từng biến thể
        type: Number,
        default: 0,
    },
    totalSold: { type: Number, default: 0 },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

// Indexing
productSchema.index({ name: 'text', description: 'text' }); // Index text for search
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ 'variants.sku': 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratingsAverage: -1, ratingsQuantity: -1});

module.exports = mongoose.model('Product', productSchema);