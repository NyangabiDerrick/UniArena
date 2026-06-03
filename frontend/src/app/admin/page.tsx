"use client"

import Link from "next/link"
import { Users, Building2, Calendar, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"

const stats = [
  { label:"Total Users", value:"842", sub:"+12 this week", icon:Users, bg:"#EFF6FF", color:"#1D4ED8" },
  { label:"Active Clubs", value:"34", sub:"+2 this month", icon:Building2, bg:"#F0FDF4", color:"#15803D" },
  { label:"Upcoming Events", value:"18", sub:"Next 30 days", icon:Calendar, bg:"#FFF7ED", color:"#C2410C" },
  { label:"Pending Approvals", value:"7", sub:"Needs attention", icon:AlertCircle, bg:"#FEF2F2", color:"#DC2626" },
]

const activity = [
  { action:"Club request submitted", detail:"Photography Society by John Student", time:"2 minutes ago", type:"pending" },
  { action:"Event approved", detail:"Annual Sports Day by Sarah Admin", time:"1 hour ago", type:"approved" },
  { action:"User suspended", detail:"Account violation — user@university.ac", time:"3 hours ago", type:"rejected" },
  { action:"Club approved", detail:"Debate Society now active", time:"Yesterday", type:"approved" },
  { action:"New user registered", detail:"newstudent@university.ac joined", time:"Yesterday", type:"pending" },
]

const quickActions = [
  { label:"Manage Users", desc:"View, suspend, change roles", href:"/admin/users", icon:Users, bg:"#EFF6FF", color:"#1D4ED8" },
  { label:"Approval Queue", desc:"7 items pending review", href:"/admin/approvals", icon:AlertCircle, bg:"#FFF7ED", color:"#C2410C" },
  { label:"Audit Logs", desc:"View all admin actions", href:"/admin/audit", icon:Clock, bg:"#F5F3FF", color:"#6D28D9" },
]

function StatusDot({ type }: { type: string }) {
  const color = type === "approved" ? "#16A34A" : type === "rejected" ? "#DC2626" : "#D97706"
  const Icon = type === "approved" ? CheckCircle : type === "rejected" ? XCircle : Clock
  return <Icon size={15} color={color} style={{ flexShrink: 0 }} />
}

export default function AdminPage() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0, totalClubs: 0, totalEvents: 0, pendingApprovals: 0
  })

  useEffect(() => {
    api.getAdminAnalytics()
      .then(res => setAnalytics(res.data))
      .catch(err => console.error('Failed to fetch analytics:', err))
  }, [])

  const stats = [
    { label:"Total Users", value: String(analytics.totalUsers), sub:"Registered users", icon:Users, bg:"#EFF6FF", color:"#1D4ED8" },
    { label:"Active Clubs", value: String(analytics.totalClubs), sub:"Approved clubs", icon:Building2, bg:"#F0FDF4", color:"#15803D" },
    { label:"Upcoming Events", value: String(analytics.totalEvents), sub:"Approved events", icon:Calendar, bg:"#FFF7ED", color:"#C2410C" },
    { label:"Pending Approvals", value: String(analytics.pendingApprovals), sub:"Needs attention", icon:AlertCircle, bg:"#FEF2F2", color:"#DC2626" },
  ]