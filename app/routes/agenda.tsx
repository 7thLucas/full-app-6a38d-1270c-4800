import { RequireClinicAuth } from "~/features/shell/require-auth";
import { AgendaBoard } from "~/features/agenda/agenda-board";

export default function AgendaRoute() {
  return (
    <RequireClinicAuth>
      <AgendaBoard />
    </RequireClinicAuth>
  );
}
