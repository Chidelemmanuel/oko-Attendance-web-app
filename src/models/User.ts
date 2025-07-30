import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
    identifier: string; // studentId or staffId
    fullName: string;
    email: string;
    password?: string;
    role: 'student' | 'lecturer';
}

const UserSchema: Schema<IUser> = new Schema({
    identifier: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, required: true, enum: ['student', 'lecturer'] },
}, { timestamps: true });

const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
