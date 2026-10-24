"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import { api } from "@/lib/api"

const roleLabel: Record<string, string> = {
  STUDENT: "Student",
  CLUB_LEADER: "Leader",
  SPORTS_CAPTAIN: "Leader",
  LECTURER: "Staff",
  MODERATOR: "Moderator",
  ADMIN: "Admin"
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (status !== "authenticated") return
    api.getProfile()
      .then(res => setProfile(res.data))
      .catch(err => console.error("Failed to load profile:", err))
  }, [status])

  const user = session?.user
  const memberships = profile?.clubMemberships || []

  const field = (label: string, value?: string | null) => (
    <div>
      <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 14, color: "#0B1D3A", fontWeight: 500 }}>{value || "Not set"}</p>
    </div>
  )

  return (
    <MainLayout>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: 28,
          fontWeight: 700, color: "#0B1D3A", marginBottom: 24
        }}>My Profile</h1>

        <div style={{
          background: "white", borderRadius: 16, padding: 28,
          border: "1px solid #E4E2DC", marginBottom: 20
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: "#0B1D3A", color: "#C9A84C",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 26
            }}>{user?.name?.charAt(0)}</div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0B1D3A" }}>{user?.name}</h2>
              <span style={{
                fontSize: 11, padding: "3px 10px", borderRadius: 99,
                background: "#EFF6FF", color: "#1D4ED8", fontWeight: 500
              }}>{roleLabel[user?.role || ""] || user?.role}</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {field("Email", user?.email)}
            {field("Student ID", user?.studentId)}
            {field("Faculty", user?.faculty)}
            {field("Year of study", profile?.yearOfStudy ? String(profile.yearOfStudy) : null)}
          </div>
        </div>

        <div style={{
          background: "white", borderRadius: 16, padding: 28,
          border: "1px solid #E4E2DC"
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 18,
            color: "#0B1D3A", marginBottom: 16
          }}>My Clubs and Societies</h2>

          {memberships.length === 0 ? (
            <p style={{ fontSize: 14, color: "#6B6962" }}>
              You haven't joined any clubs or societies yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {memberships.map((m: any) => (
                <div key={m.id} style={{
                  padding: "12px 16px", borderRadius: 10,
                  border: "1px solid #F3F4F6", fontSize: 14, color: "#0B1D3A"
                }}>
                  {m.club?.name}
                  <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 8 }}>
                    {m.club?.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}