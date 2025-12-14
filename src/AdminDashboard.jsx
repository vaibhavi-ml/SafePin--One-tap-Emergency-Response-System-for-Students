/// src/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { messaging, getToken, onMessage } from "./firebase";
import {
  db,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "./firebase";

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [filter, setFilter] = useState("all");

  // 🔔 ADMIN NOTIFICATIONS
  useEffect(() => {
    Notification.requestPermission().then(async (permission) => {
      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: "YOUR_PUBLIC_VAPID_KEY",
        });
        console.log("ADMIN FCM TOKEN:", token);
      }
    });

    onMessage(messaging, (payload) => {
      alert("🚨 NEW SOS: " + payload.notification?.body);
    });
  }, []);

  // 🔄 REALTIME INCIDENTS
  useEffect(() => {
    const q = query(
      collection(db, "incidents"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIncidents(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "incidents", id), { status });
  };

  return (
    <div className="card" style={{ padding: 20 }}>
      <h2>Admin Dashboard – Live SOS Alerts</h2>

      {/* FILTER */}
      <div style={{ marginBottom: 12 }}>
        <strong>Filter:</strong>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ marginLeft: 10 }}
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {incidents.length === 0 ? (
        <p>No SOS incidents yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr>
              <th style={th}>Time</th>
              <th style={th}>Student</th>
              <th style={th}>Emergency</th>
              <th style={th}>Context</th>
              <th style={th}>Location</th>
              <th style={th}>Status</th>
            </tr>
          </thead>

          <tbody>
            {incidents
              .filter((inc) => filter === "all" || inc.status === filter)
              .map((inc) => (
                <tr key={inc.id}>
                  <td style={td}>
                    {inc.createdAt?.toDate
                      ? inc.createdAt.toDate().toLocaleString()
                      : "-"}
                  </td>

                  <td style={td}>{inc.studentId}</td>
                  <td style={td}>
                    <div><b>{inc.emergencyType}</b></div>

                    {/* 🔹 TRIGGER SOURCE BADGE */}
                    <span
                      style={{
                        padding: "3px 6px",
                        borderRadius: "12px",
                        background: "#eef",
                        fontSize: "0.75rem",
                        display: "inline-block",
                        marginTop: "4px",
                      }}
                    >
                      {inc.triggeredBy === "wearable" && "⌚ Wearable"}
                      {inc.triggeredBy === "keychain" && "🔑 Keychain"}
                      {inc.triggeredBy === "auto" && "❤️ Auto Trigger"}
                      {inc.triggeredBy === "mobile" && "📱 Mobile"}
                    </span>
                  </td>


                  <td style={td}>
                    {inc.locationType === "hostel" ? "🏠 Hostel" : "🌳 Campus"}
                  </td>

                  {/* ✅ LOCATION DETAILS */}
                  <td style={td}>
                    {inc.locationType === "hostel" && (
                      <div style={locationBox}>
                        <div><b>Block:</b> {inc.block}</div>
                        <div><b>Floor:</b> {inc.floor}</div>
                        <div><b>Room:</b> {inc.room}</div>
                      </div>
                    )}

                    {inc.locationType === "campus" && (
                      <div style={locationBox}>
                        <div><b>DigiPIN:</b> {inc.digipin || "-"}</div>
                      </div>
                    )}

                    {/* ✅ MAP LINKS FOR BOTH */}
                    {inc.lat != null && inc.lng != null ? (
                      <div style={{ marginTop: 6 }}>
                        <a
                          href={`https://www.google.com/maps?q=${inc.lat},${inc.lng}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          📍 View Location
                        </a>
                        <br />
                        <a
                          href={`https://www.google.com/maps/search/hospital/@${inc.lat},${inc.lng},15z`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          🏥 Nearby Hospitals
                        </a>
                        <br />
                        <a
                          href={`https://www.google.com/maps/search/security/@${inc.lat},${inc.lng},15z`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          🏠 Nearby Security / Hostels
                        </a>
                      </div>
                    ) : (
                      <div style={{ color: "#888", marginTop: 6 }}>
                        Location unavailable
                      </div>
                    )}
                  </td>

                  <td style={td}>
                    {inc.status !== "resolved" ? (
                      <>
                        <button
                          onClick={() => updateStatus(inc.id, "in-progress")}
                          style={{ marginRight: 6 }}
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => updateStatus(inc.id, "resolved")}
                        >
                          Resolve
                        </button>
                      </>
                    ) : (
                      <span>Resolved ✔</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

      )}
    </div>
  );
}

/* STYLES */
const th = {
  border: "1px solid #ccc",
  padding: "6px",
  background: "#f5f5f5",
};

const td = {
  border: "1px solid #ccc",
  padding: "6px",
  verticalAlign: "top",
};

const locationBox = {
  background: "#eef6ff",
  padding: "6px",
  borderRadius: "6px",
  border: "1px solid #cce0ff",
};
