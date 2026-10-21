import type { Metadata } from "next";
import { DoctorView } from "@/components/doctor/doctor-view";

export const metadata: Metadata = { title: "Doctor" };

export default function DoctorPage() {
  return <DoctorView />;
}
