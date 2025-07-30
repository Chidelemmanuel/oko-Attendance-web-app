import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICourse extends Document {
    code: string;
    name: string;
    attendanceCode: string | null;
    lecturerId: mongoose.Schema.Types.ObjectId;
    latitude?: number;
    longitude?: number;
}

const CourseSchema: Schema<ICourse> = new Schema({
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    attendanceCode: { type: String, trim: true, default: null },
    lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    latitude: { type: Number },
    longitude: { type: Number },
}, { timestamps: true });

const CourseModel: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default CourseModel;
