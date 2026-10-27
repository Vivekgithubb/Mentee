import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    originalFilename: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true
    },
    documentType: {
      type: String,
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
      default: 'Other academic document'
    },
    description: {
      type: String,
      default: ''
    },
    mimeType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    storageProvider: {
      type: String,
      enum: ['cloudinary', 'local'],
      default: 'local'
    },
    storageId: {
      type: String,
      required: true
    },
    secureUrl: {
      type: String,
      required: true
    },
    documentRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DocumentRequest',
      default: null
    },
    reviewStatus: {
      type: String,
      enum: ['PENDING_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'PENDING_REVIEW'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    reviewComment: {
      type: String,
      default: ''
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    reviewHistory: [
      {
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['PENDING_REVIEW', 'APPROVED', 'REJECTED'] },
        comment: { type: String, default: '' },
        date: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const Document = mongoose.model('Document', documentSchema);
