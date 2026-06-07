/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_PASSWORD: string;
  readonly VITE_DASHBOARD_PASSWORD: string;
  readonly VITE_ATTENDANCE_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
