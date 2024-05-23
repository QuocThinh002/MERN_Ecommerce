const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Review must belong to a product'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user'],
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
  },
  images: {
    type: [String], 
    validate: {
      validator: function(value) {
        return value.length <= 6;
      },
      message: 'You can only upload a maximum of 6 images',
    },
  },
  video: String,
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual populate (query optimization)
reviewSchema.virtual('likesCount').get(function () {
  return this.likes.length;
});

reviewSchema.virtual('dislikesCount').get(function () {
  return this.dislikes.length;
});

// Index
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true }); // Make sure each user can only rate a product once
reviewSchema.index({ productId: 1 });
reviewSchema.index({ userId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
