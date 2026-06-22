import { RequireClinicAuth } from "~/features/shell/require-auth";
import { PatientsView } from "~/features/agenda/patients-view";

export default function PacientesRoute() {
  return (
    <RequireClinicAuth>
      <PatientsView />
    </RequireClinicAuth>
  );
}
