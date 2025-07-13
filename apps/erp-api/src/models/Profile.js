const { Schema, model } = require('mongoose');

const profileSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    default: '',
  },
  sexe: {
    type: String,
    default: 'X',
    enum: ['F', 'M', 'X'],
  },
});

module.exports = model('Profile', profileSchema);
