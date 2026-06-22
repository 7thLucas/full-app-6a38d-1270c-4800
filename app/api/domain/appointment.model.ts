import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

@modelOptions({
  schemaOptions: {
    collection: "tbl_appointments",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Appointment extends CommonTypegooseEntity {
  @prop({ type: String, required: true, trim: true })
  patientName!: string;

  @prop({ type: String, required: true })
  professionalId!: string;

  @prop({ type: String, default: "" })
  treatment!: string;

  /** Start date-time of the appointment. */
  @prop({ type: Date, required: true })
  start!: Date;

  @prop({ type: Number, default: 30 })
  durationMinutes!: number;

  @prop({ type: String, default: "programada" })
  status!: string;

  @prop({ type: String, default: "" })
  notes!: string;
}

export const AppointmentModel = getModelForClass(Appointment);
