import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

@modelOptions({
  schemaOptions: {
    collection: "tbl_patients",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Patient extends CommonTypegooseEntity {
  @prop({ type: String, required: true, trim: true })
  name!: string;

  @prop({ type: String, default: "" })
  phone!: string;

  @prop({ type: String, default: "" })
  email!: string;

  @prop({ type: String, default: "" })
  notes!: string;
}

export const PatientModel = getModelForClass(Patient);
