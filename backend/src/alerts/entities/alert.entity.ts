import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({ collection: "alerts", timestamps: true })
export class Alert {
    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    symbol: string;

    @Prop({ required: true })
    targetPrice: number;

    @Prop({ default: false })
    triggered: boolean;
}
export type AlertDocument = HydratedDocument<Alert>;
export const AlertSchema = SchemaFactory.createForClass(Alert);