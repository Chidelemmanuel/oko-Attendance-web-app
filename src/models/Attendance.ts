import mongoose, { Document, Schema, Model } from 'mongoose';
import type { AttendanceStatus } from '@/lib/constants';

export interface IAttendance extends Document {
    studentId: mongoose.Schema.Types.ObjectId;
    courseId: mongoose.Schema.Types.ObjectId;
    date: Date;
    status: AttendanceStatus;
    verifiedLocation?: boolean;
    locationScore?: number;
    remarks?: string;
}

const AttendanceSchema: Schema<IAttendance> = new Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    date: { type: Date, required: true, default: Date.now },
    status: { type: String, required: true, enum: ['Present', 'Absent', 'Late', 'Excused'] },
    verifiedLocation: { type: Boolean },
    locationScore: { type: Number, min: 0, max: 1 },
    remarks: { type: String, trim: true },
}, { timestamps: true });

const AttendanceModel: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default AttendanceModel;
