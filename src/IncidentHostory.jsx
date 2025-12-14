import { useEffect, useState } from "react";
import { db, collection, query, orderBy, onSnapshot } from "./firebase";

export default function IncidentHistory() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "incidents"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setIncidents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  return (
    <div>
      <h2>Incident History</h2>
      <ul>
        {incidents.map((i) => (
          <li key={i.id}>
            {i.studentId} – {i.emergencyType} – {i.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
