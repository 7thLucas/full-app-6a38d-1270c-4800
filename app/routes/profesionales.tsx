import { RequireClinicAuth } from "~/features/shell/require-auth";
import { ProfessionalsView } from "~/features/agenda/professionals-view";

export default function ProfesionalesRoute() {
  return (
    <RequireClinicAuth>
      <ProfessionalsView />
    </RequireClinicAuth>
  );
}
