import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

@modelOptions({
  schemaOptions: {
    collection: "tbl_professionals",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Professional extends CommonTypegooseEntity {
  @prop({ type: String, required: true, trim: true })
  name!: string;

  @prop({ type: String, default: "" })
  specialty!: string;

  @prop({ type: String, default: "#0fb8b0" })
  color!: string;

  @prop({ type: Boolean, default: true })
  active!: boolean;
}

export const ProfessionalModel = getModelForClass(Professional);
