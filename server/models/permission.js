const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const permissionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /*createdDate: {
      type: Date,
      required: true,
    },*/
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /*updatedDate: {
      type: Date,
      required: true,
    },*/
  },
  {
    timestamps: {
      createdAt: 'createdDate',
      updatedAt: 'updatedDate'
    }
  }
);

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;