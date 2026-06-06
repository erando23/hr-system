// src/hooks/useApi.js
// Hook generik untuk API calls dengan loading/error state

import { useState, useCallback } from "react";

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const call = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Terjadi kesalahan");
        return null;
      }
      return json.data;
    } catch (e) {
      setError("Koneksi gagal. Periksa internet Anda.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { call, loading, error, clearError: () => setError(null) };
}

// Hook khusus untuk auth
export function useAuth() {
  const { call, loading } = useApi();

  const login = (pin) =>
    call("/api/auth/login", { method: "POST", body: { pin } });

  const logout = () =>
    call("/api/auth/logout", { method: "POST" });

  const getMe = () =>
    call("/api/auth/me");

  return { login, logout, getMe, loading };
}

// Hook untuk attendance
export function useAttendance() {
  const { call, loading, error } = useApi();

  const getAttendance = (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return call(`/api/attendance${qs ? "?" + qs : ""}`);
  };

  const checkIn = (lat, lng) =>
    call("/api/attendance", { method: "POST", body: { action: "checkin", lat, lng } });

  const checkOut = (lat, lng) =>
    call("/api/attendance", { method: "POST", body: { action: "checkout", lat, lng } });

  const override = (attendanceId, updates) =>
    call("/api/attendance", { method: "PATCH", body: { attendanceId, ...updates } });

  return { getAttendance, checkIn, checkOut, override, loading, error };
}

// Hook untuk schedule
export function useSchedule() {
  const { call, loading } = useApi();

  const getSchedule = (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return call(`/api/schedule${qs ? "?" + qs : ""}`);
  };

  const saveSchedule = (items) =>
    call("/api/schedule", { method: "POST", body: { schedules: items } });

  return { getSchedule, saveSchedule, loading };
}

// Hook untuk kasbon
export function useKasbon() {
  const { call, loading } = useApi();

  const getKasbon = (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return call(`/api/kasbon${qs ? "?" + qs : ""}`);
  };

  const addKasbon = (data) =>
    call("/api/kasbon", { method: "POST", body: data });

  const updateKasbon = (id, status) =>
    call("/api/kasbon", { method: "PATCH", body: { id, status } });

  return { getKasbon, addKasbon, updateKasbon, loading };
}

// Hook untuk employees
export function useEmployees() {
  const { call, loading } = useApi();

  const getEmployees = (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return call(`/api/employees${qs ? "?" + qs : ""}`);
  };

  const addEmployee = (data) =>
    call("/api/employees", { method: "POST", body: data });

  const updateEmployee = (data) =>
    call("/api/employees", { method: "PATCH", body: data });

  return { getEmployees, addEmployee, updateEmployee, loading };
}

// Hook untuk outlets
export function useOutlets() {
  const { call, loading } = useApi();

  const getOutlets = () =>
    call("/api/outlets");

  const addOutlet = (data) =>
    call("/api/outlets", { method: "POST", body: data });

  const updateOutlet = (data) =>
    call("/api/outlets", { method: "PATCH", body: data });

  return { getOutlets, addOutlet, updateOutlet, loading };
}

// Hook untuk payroll
export function usePayroll() {
  const { call, loading } = useApi();

  const getPayroll = (month, outletId) =>
    call(`/api/payroll?month=${month}${outletId ? "&outletId=" + outletId : ""}`);

  const generatePayroll = (month, outletId) =>
    call("/api/payroll", { method: "POST", body: { month, outletId } });

  return { getPayroll, generatePayroll, loading };
}
