import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema()
export class User {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: false })
    fcmToken: string;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);