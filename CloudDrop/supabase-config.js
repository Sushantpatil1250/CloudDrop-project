// Supabase web configuration.
// Get both values from: Supabase Dashboard -> Project Settings -> API (or "API Keys").
// Use ONLY the "anon" / "publishable" key here. It is designed for browsers and is safe to expose
// because your data is protected by Row Level Security / Storage policies (see setup.sql).
// NEVER put the "service_role" / "secret" key in this project. That key bypasses all security.

export const SUPABASE_URL = "https://vrtznzjcpftshwslanmd.supabase.co"; // e.g. https://abcdxyz.supabase.co
export const SUPABASE_KEY = "sb_publishable_AlXBdLgFchwEzwbx4EQtbA__qvr_Drv";
export const BUCKET = "files";
