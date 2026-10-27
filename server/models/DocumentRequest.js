import mongoose from 'mongoose';

const documentRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    documentType: {
      type: String,
      required: true,
      enum: [
        'Semester marks card',
        'Consolidated marks card',
        'Certificate',
        'Internship certificate',
        'Resume',
        'Project report',
        'Research paper',
        'Identity or institutional document',
        'Other academic document'
      ],
      default: 'Semester marks card'
    },
    description: {
      type: String,
      default: ''
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'HIGH'
    },
    dueDate: {
      type: Date,
      required: true
    },
    isRequired: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'UPLOADED', 'UNDER REVIEW', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    submittedDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null
    },
    reviewHistory: [
      {
        reviewer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        action: {
          type: String,
          enum: ['REQUESTED', 'UPLOADED', 'RESUBMITTED', 'APPROVED', 'REJECTED']
        },
        reason: {
          type: String,
          default: ''
        },
        date: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

// Virtual property to check if request is overdue
documentRequestSchema.virtual('isOverdue').get(function () {
  if (['APPROVED'].includes(this.status)) return false;
  return new Date() > new Date(this.dueDate);
});

documentRequestSchema.set('toJSON', { virtuals: true });
documentRequestSchema.set('toObject', { virtuals: true });

export const DocumentRequest = mongoose.model('DocumentRequest', documentRequestSchema);
