"use client";
import React from "react";

interface TicketTemplateProps {
  passengers: any[];
  flights: any[];
  bookingDetails: any;
  gstDetails: any;
  fareDetails: any;
}

const TicketTemplate = React.forwardRef<HTMLDivElement, TicketTemplateProps>(
  ({ passengers, flights, bookingDetails, gstDetails, fareDetails }, ref) => {

    const defaultPassengers = [
      {
        name: "Mr.Ameen Razil Chelappilly Noushad",
        ticketNo: "A74C7Z",
        seat: "Not selected",
        meal: "Not selected",
        baggage: "15 Kg",
        handBaggage: "7kg",
      },
    ];

    const defaultFlights = [
      {
        flightNumber: "6E-738",
        airline: "IndiGo",
        from: "Kochi",
        fromCode: "COK",
        to: "Bangalore",
        toCode: "BLR",
        departure: {
          time: "16:20",
          date: "Fri, 17 Apr, 2026",
          airport: "Kochi Arpt",
          terminal: "Terminal 1",
        },
        arrival: {
          time: "17:35",
          date: "Fri, 17 Apr, 2026",
          airport: "Bengaluru Arpt",
          terminal: "Terminal 1",
        },
        duration: "1h 15m",
        pnr: "A74C7Z",
        cabinClass: "Economy",
      },
    ];

    const defaultBookingDetails = {
      date: "Wed, 08 Apr, 2026",
      referenceId: "CT1226387",
    };

    const defaultGstDetails = {
      name: "GOLDEN TRAVELS",
      no: "32GSDPM8932C1ZT",
      address: "16/580C KIZHISSERI KERALA",
      email: "MKFAHIZ@GMAIL.COM",
      phone: "8089794927",
    };

    const defaultFareDetails = {
      base: "2,533.00",
      tax: "1,092.70",
      misc: "1,600.00",
      total: "5,225.70",
    };

    const resolvedPassengers = passengers?.length ? passengers : defaultPassengers;
    const resolvedFlights    = flights?.length    ? flights    : defaultFlights;
    const resolvedBooking    = bookingDetails     || defaultBookingDetails;
    const resolvedGst        = gstDetails         || defaultGstDetails;
    const resolvedFare       = fareDetails        || defaultFareDetails;

    return (
      <div
        ref={ref}
        style={{
          fontFamily: "'Segoe UI', sans-serif",
          backgroundColor: "#ffffff",
          width: "860px",
          margin: "0 auto",
          padding: "32px 40px",
          color: "#1f2937",
          border: "1px solid #e5e7eb",
          boxSizing: "border-box",
        }}
        id="ticket-template"
      >

        {/* ── Centered E-Ticket heading — matches PDF ── */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "30px", fontWeight: "600", letterSpacing: "-0.5px", margin: 0 }}>
            E-Ticket
          </h1>
        </div>

        {/* ── Logo (left) + Agency info (right) ── */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: "18px",
        }}>
          <div style={{ width: "90px", height: "90px", flexShrink: 0 }}>
            <img
              src="/assets/images/logo.png"
              alt="Golden Travels Logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          <div style={{ textAlign: "right", fontSize: "13px", lineHeight: "1.6" }}>
            <p style={{ margin: 0, fontWeight: "700", fontSize: "15px" }}>Golden Traveler</p>
            <p style={{ margin: 0, color: "#374151" }}>mkfahiz@gmail.com</p>
            <p style={{ margin: 0, color: "#374151" }}>+91 8089794927</p>
            <p style={{ margin: 0, color: "#374151" }}>MANJERI ROAD, KIZHISSERI, MALAPPURAM</p>
            <p style={{ margin: 0, color: "#374151" }}>Malappuram-673641</p>
          </div>
        </div>

        {/* ── Booking meta ── */}
        <div style={{
          display: "flex", justifyContent: "flex-end", gap: "28px",
          fontSize: "13px", borderBottom: "1px solid #e5e7eb",
          paddingBottom: "12px", marginBottom: "24px",
        }}>
          <p style={{ margin: 0 }}>
            <span style={{ color: "#374151" }}>Booking date </span>
            <strong>{resolvedBooking.date}</strong>
          </p>
          <p style={{ margin: 0 }}>
            <span style={{ color: "#374151" }}>Reference ID </span>
            <strong>{resolvedBooking.referenceId}</strong>
          </p>
        </div>

        {/* ── Flights ── */}
        {resolvedFlights.map((flight, idx) => (
          <div key={idx} style={{ marginBottom: "28px" }}>

            {/* Sector header bar */}
            <div style={{
              backgroundColor: "#f9fafb",
              borderTop: "1px solid #e5e7eb",
              borderBottom: "1px solid #e5e7eb",
              padding: "8px 12px",
              display: "flex", justifyContent: "space-between",
              fontSize: "14px", fontWeight: "700",
              marginBottom: "16px",
            }}>
              <span>{flight.from}({flight.fromCode}) - {flight.to}({flight.toCode})</span>
              <span>Airline PNR {flight.pnr}</span>
            </div>

            {/* Flight detail columns */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.4fr 1.4fr 0.9fr 0.9fr",
              gap: "12px", fontSize: "13px", padding: "0 4px",
            }}>
              <div>
                <p style={{ margin: "0 0 4px", color: "#374151", fontSize: "12px", fontWeight: "600" }}>Flight</p>
                <p style={{ margin: "0 0 6px", fontWeight: "700", fontSize: "15px" }}>{flight.flightNumber}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{
                    backgroundColor: "#2563eb", color: "#fff",
                    fontSize: "10px", padding: "1px 5px", borderRadius: "3px",
                    fontWeight: "600", letterSpacing: "0.3px",
                  }}>Indigo</span>
                  <span style={{ color: "#374151", fontSize: "11px" }}>{flight.airline}</span>
                </div>
              </div>

              <div>
                <p style={{ margin: "0 0 4px", color: "#374151", fontSize: "12px", fontWeight: "600" }}>Departure</p>
                <p style={{ margin: "0 0 3px", fontWeight: "700", fontSize: "15px" }}>{flight.from}({flight.fromCode})</p>
                <p style={{ margin: "0 0 3px", fontWeight: "700", fontSize: "12px" }}>{flight.departure.date} {flight.departure.time}</p>
                <p style={{ margin: 0, color: "#374151", fontSize: "11px" }}>{flight.departure.airport} {flight.departure.terminal}</p>
              </div>

              <div>
                <p style={{ margin: "0 0 4px", color: "#374151", fontSize: "12px", fontWeight: "600" }}>Arrival</p>
                <p style={{ margin: "0 0 3px", fontWeight: "700", fontSize: "15px" }}>{flight.to}({flight.toCode})</p>
                <p style={{ margin: "0 0 3px", fontWeight: "700", fontSize: "12px" }}>{flight.arrival.date} {flight.arrival.time}</p>
                <p style={{ margin: 0, color: "#374151", fontSize: "11px" }}>{flight.arrival.airport} {flight.arrival.terminal}</p>
              </div>

              <div>
                <p style={{ margin: "0 0 4px", color: "#374151", fontSize: "12px", fontWeight: "600" }}>Duration</p>
                <p style={{ margin: 0, fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {flight.duration}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 4px", color: "#374151", fontSize: "12px", fontWeight: "600" }}>Cabin class</p>
                <p style={{ margin: 0, fontWeight: "700" }}>{flight.cabinClass}</p>
              </div>
            </div>
          </div>
        ))}

        {/* ── Passenger Details ── */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{
            backgroundColor: "#e5e7eb", padding: "8px 12px",
            fontSize: "14px", fontWeight: "700", marginBottom: "8px",
          }}>
            Passenger details
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                {["No", "Passenger name", "Sector", "Ticket number", "Seat", "Meal", "Check-in baggage", "Hand baggage"].map((h, i) => (
                  <th key={i} style={{
                    padding: "8px 6px", fontWeight: "600",
                    textAlign: i === 2 ? "center" : "left",
                    whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resolvedPassengers.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px 6px" }}>{idx + 1}</td>
                  <td style={{ padding: "12px 6px", fontWeight: "700" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"/>
                      </svg>
                      {p.name}
                    </div>
                  </td>
                  <td style={{ padding: "12px 6px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontWeight: "700" }}>
                        {resolvedFlights[0]?.fromCode}-{resolvedFlights[0]?.toCode}
                      </span>
                      {/* QR placeholder */}
                      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2"  y="2"  width="14" height="14" fill="none" stroke="#000" strokeWidth="1.5"/>
                        <rect x="5"  y="5"  width="8"  height="8"  fill="#000"/>
                        <rect x="24" y="2"  width="14" height="14" fill="none" stroke="#000" strokeWidth="1.5"/>
                        <rect x="27" y="5"  width="8"  height="8"  fill="#000"/>
                        <rect x="2"  y="24" width="14" height="14" fill="none" stroke="#000" strokeWidth="1.5"/>
                        <rect x="5"  y="27" width="8"  height="8"  fill="#000"/>
                        {[
                          [20,2],[22,2],[20,4],[24,6],[20,6],[22,8],[20,10],[24,10],
                          [2,20],[4,20],[8,20],[10,20],[2,22],[6,22],[10,22],
                          [20,20],[24,20],[22,22],[20,24],[24,24],[22,26],[20,28],[24,28],
                          [2,30],[6,30],[10,30],[4,32],[8,32],[2,34],[6,34],[10,34],
                          [20,32],[24,32],[20,34],[22,36],[24,36],
                          [28,16],[30,18],[32,16],[36,16],[28,20],[34,20],[36,20],
                          [30,22],[32,24],[28,26],[34,26],[30,28],[36,28],
                        ].map(([x, y], i) => (
                          <rect key={i} x={x} y={y} width="2" height="2" fill="#000"/>
                        ))}
                      </svg>
                    </div>
                  </td>
                  <td style={{ padding: "12px 6px", fontWeight: "700" }}>{p.ticketNo}</td>
                  <td style={{ padding: "12px 6px" }}>{p.seat}</td>
                  <td style={{ padding: "12px 6px" }}>{p.meal}</td>
                  <td style={{ padding: "12px 6px" }}>
                    <span style={{ fontWeight: "700" }}>{p.baggage}</span>
                    <div style={{ color: "#374151", fontSize: "10px", marginTop: "2px" }}>
                      +INTL Connection Baggage 8 Kg
                    </div>
                  </td>
                  <td style={{ padding: "12px 6px", fontWeight: "700" }}>{p.handBaggage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── GST Details ── */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{
            backgroundColor: "#e5e7eb", padding: "8px 12px",
            fontSize: "14px", fontWeight: "700", marginBottom: "8px",
          }}>
            GST Details
          </div>
          <table style={{ width: "100%", fontSize: "11px" }}>
            <thead>
              <tr style={{ color: "#374151" }}>
                {["GST Name", "GST No", "GST Address", "GST Email", "GST Phone"].map((h, i) => (
                  <th key={i} style={{ padding: "0 8px 6px 0", fontWeight: "600", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ fontWeight: "700" }}>
                <td style={{ padding: "0 8px 0 0" }}>{resolvedGst.name}</td>
                <td style={{ padding: "0 8px 0 0" }}>{resolvedGst.no}</td>
                <td style={{ padding: "0 8px 0 0" }}>{resolvedGst.address}</td>
                <td style={{ padding: "0 8px 0 0" }}>{resolvedGst.email}</td>
                <td>{resolvedGst.phone}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Fare Details ── */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{
            backgroundColor: "#e5e7eb", padding: "8px 12px",
            fontSize: "14px", fontWeight: "700", marginBottom: "10px",
          }}>
            Fare details
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
            {[
              { label: "Base price",                                      value: resolvedFare.base },
              { label: "Airline taxes and fees",                          value: resolvedFare.tax  },
              { label: "Meal / Seat / baggage / other Misc charges",      value: resolvedFare.misc },
            ].map(({ label, value }, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0 8px" }}>
                <span style={{ color: "#374151", fontWeight: "500" }}>{label}</span>
                <span style={{ fontWeight: "700" }}>INR {value}</span>
              </div>
            ))}
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "10px 8px 0", borderTop: "1px solid #e5e7eb", marginTop: "4px",
            }}>
              <span style={{ color: "#2563eb", fontWeight: "700" }}>Total Amount</span>
              <span style={{ color: "#2563eb", fontWeight: "700", fontSize: "16px", fontFamily: "monospace" }}>
                INR {resolvedFare.total}
              </span>
            </div>
          </div>
        </div>

        {/* ── Important Information ── */}
        <div>
          <div style={{
            backgroundColor: "#e5e7eb", padding: "8px 12px",
            fontSize: "14px", fontWeight: "700", marginBottom: "10px",
          }}>
            Important Information
          </div>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "12px", color: "#374151", lineHeight: "2" }}>
            <li>Please reach the airport 3 hours before the departure time.</li>
            <li>Check-in counters at the airport close 60 minutes before departure</li>
            <li>Your carry-on baggage shouldn't weigh more than 7kgs</li>
            <li>Carry photo identification, you will need it as proof of identity while checking-in</li>
            <li>Use the airline PNR for all correspondence directly with the airline.</li>
          </ul>
        </div>

      </div>
    );
  }
);

TicketTemplate.displayName = "TicketTemplate";
export default TicketTemplate;