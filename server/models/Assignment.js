import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    assignedDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUBMITTED', 'COMPLETED', 'OVERDUE'],
      default: 'PENDING'
    },
    submissionNotes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Virtual property for overdue status
assignmentSchema.virtual('isOverdue').get(function () {
  if (['COMPLETED', 'SUBMITTED'].includes(this.status)) return false;
  return new Date() > new Date(this.dueDate);
});

assignmentSchema.set('toJSON', { virtuals: true });
assignmentSchema.set('toObject', { virtuals: true });

export const Assignment = mongoose.model('Assignment', assignmentSchema);
