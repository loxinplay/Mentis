"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  Check,
  Cpu,
  Globe,
  MapPin,
  Scale,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";


type AuthMode = "login" | "signup";

function AuthModal(props: {
  open: boolean;
  mode: AuthMode;
  setMode: (m: AuthMode) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  err: string | null;
  setErr: (v: string | null) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  onClose: () => void;
  onAuthed: (email: string) => void;
}) {
  const {
    open,
    mode,
    setMode,
    email,
    setEmail,
    password,
    setPassword,
    err,
    setErr,
    loading,
    setLoading,
    onClose,
    onAuthed,
  } = props;

  if (!open) return null;

  const submit = async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(mode === "signup" ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setErr(data?.error || "Неверный email или пароль.");
        return;
      }
      if (data?.needsEmailConfirm) {
        setErr("Проверь почту и подтверди email. После подтверждения — войди.");
        return;
      }
      onAuthed(email);
      onClose();
      setEmail("");
      setPassword("");
    } catch {
      setErr("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} role="dialog" aria-modal="true">
      <div className="h-dvh w-full flex items-center justify-center p-4">
        <div
          className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="font-bold text-slate-900">{mode === "signup" ? "Регистрация" : "Вход"}</div>
            <button onClick={onClose} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => { setErr(null); setMode("login"); }}
                className={`flex-1 px-3 py-2 rounded-xl border text-sm font-semibold ${
                  mode === "login" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Войти
              </button>
              <button
                onClick={() => { setErr(null); setMode("signup"); }}
                className={`flex-1 px-3 py-2 rounded-xl border text-sm font-semibold ${
                  mode === "signup" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Регистрация
              </button>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-base outline-none focus:border-blue-300"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Пароль
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-base outline-none focus:border-blue-300"
                placeholder="••••••••"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </label>

            {err && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{err}</div>
            )}

            <button
              onClick={submit}
              disabled={loading || !email || !password}
              className="w-full mt-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {loading ? <Cpu className="animate-spin" size={18} /> : null}
              {loading ? (mode === "signup" ? "Создаём…" : "Входим…") : mode === "signup" ? "Создать аккаунт" : "Войти"}
            </button>

            <div className="text-xs text-slate-500 leading-relaxed">
              Нужен Supabase Auth: настрой <b>SUPABASE_URL</b> и <b>SUPABASE_ANON_KEY</b>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function AddItemModal(props: {
  open: boolean;
  category:
    | "activities"
    | "leadership"
    | "awards"
    | "projects"
    | "volunteering"
    | "work"
    | "certificates";
  setCategory: (c: any) => void;
  draft: { [k: string]: string };
  setDraft: (d: any) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const { open, category, setCategory, draft, setDraft, onClose, onSave } = props;
  if (!open) return null;

  const fieldsByCategory: Record<string, { key: string; label: string; placeholder: string }[]> = {
    activities: [
      { key: "title", label: "Активность", placeholder: "Напр. Debate club participant" },
      { key: "org", label: "Организация", placeholder: "Школа / клуб / комьюнити" },
      { key: "dates", label: "Период", placeholder: "2024–2026" },
      { key: "desc", label: "Описание", placeholder: "1–2 предложения, что именно делал(а)" },
    ],
    leadership: [
      { key: "title", label: "Роль", placeholder: "Напр. President of Student Council" },
      { key: "org", label: "Организация", placeholder: "NIS / NGO / команда" },
      { key: "dates", label: "Период", placeholder: "2025–2026" },
      { key: "desc", label: "Impact", placeholder: "Цифры/результаты/масштаб" },
    ],
    awards: [
      { key: "title", label: "Награда", placeholder: "Olympiad Silver" },
      { key: "issuer", label: "Организатор", placeholder: "Daryn / NIS / ..." },
      { key: "date", label: "Дата", placeholder: "Feb 2026" },
      { key: "desc", label: "Детали", placeholder: "уровень, место, контекст" },
    ],
    projects: [
      { key: "title", label: "Проект", placeholder: "Mentis / QazSign / ..." },
      { key: "link", label: "Ссылка", placeholder: "GitHub / сайт / демо" },
      { key: "dates", label: "Период", placeholder: "2025–present" },
      { key: "desc", label: "Описание", placeholder: "что сделал(а), стек, результат" },
    ],
    volunteering: [
      { key: "title", label: "Волонтёрство", placeholder: "Mentoring / events / ..." },
      { key: "org", label: "Организация", placeholder: "Фонд / школа / NGO" },
      { key: "dates", label: "Период", placeholder: "2024–2025" },
      { key: "hours", label: "Часы", placeholder: "50h" },
      { key: "desc", label: "Описание", placeholder: "что делал(а), impact" },
    ],
    work: [
      { key: "title", label: "Должность", placeholder: "Intern / Tutor / ..." },
      { key: "org", label: "Компания/организация", placeholder: "..." },
      { key: "dates", label: "Период", placeholder: "Summer 2025" },
      { key: "desc", label: "Описание", placeholder: "задачи, результат" },
    ],
    certificates: [
      { key: "title", label: "Сертификат", placeholder: "IELTS / Coursera / ..." },
      { key: "issuer", label: "Issuer", placeholder: "British Council / ..." },
      { key: "date", label: "Дата", placeholder: "2026-02-01" },
      { key: "link", label: "Ссылка/файл", placeholder: "Drive link / PDF" },
    ],
  };

  const fields = fieldsByCategory[category] || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} role="dialog" aria-modal="true">
      <div className="h-dvh w-full flex items-center justify-center p-4">
        <div
          className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="font-bold text-slate-900">Добавить в Pathfolio</div>
            <button onClick={onClose} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Раздел
              <select
                value={category}
                onChange={(e) => { setDraft({}); setCategory(e.target.value as any); }}
                className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-base outline-none focus:border-blue-300 bg-white"
              >
                <option value="projects">Projects</option>
                <option value="leadership">Leadership</option>
                <option value="activities">Activities</option>
                <option value="awards">Awards</option>
                <option value="volunteering">Volunteering</option>
                <option value="work">Work experience</option>
                <option value="certificates">Certificates</option>
              </select>
            </label>

            {fields.map((f) => (
              <label key={f.key} className="block text-sm font-medium text-slate-700">
                {f.label}
                <input
                  value={draft[f.key] || ""}
                  onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-base outline-none focus:border-blue-300"
                  placeholder={f.placeholder}
                />
              </label>
            ))}

            <button
              onClick={onSave}
              className="w-full mt-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Сохранить
            </button>

            <div className="text-xs text-slate-500 leading-relaxed">
              Сейчас данные хранятся локально в состоянии страницы. Дальше можно подключить Supabase DB и сохранять в профиль.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface University {
  id: number;
  name: string;
  city: string;
  country_rank: number;
  has_dormitory: boolean;
  ml_cs_strength: number;
  tour_url: string | null;
  website: string;
  [key: string]: any;
}

const STATIC_3D_TOURS: { name: string; url: string }[] = [
  { name: "Taraz Auesov University (TAU)", url: "https://evgeniyvolkov.com/pano/tau/" },
  { name: "Kazakh University of Technology and Business (КУТиБ)", url: "https://evgeniyvolkov.com/pano/kutib/index.html" },
  { name: "KIMEP University", url: "https://www.kimep.kz/3d-tour/#pano753/179.7/30.6/74.4" },
  { name: "Turan University", url: "https://turan.edu.kz/ru/3dtour/" },
  { name: "Almaty Management University (AlmaU)", url: "https://pano3d.kz/AlmaU_VR/#media=1&yaw=-8.52&pitch=-14.65&fov=110.00" },
  { name: "Atyrau University of Oil and Gas", url: "https://vrmir3d.com/AGEU_VR/#media=1&yaw=-3.85&pitch=5.19&fov=109.96" },
  { name: "Sh. Yessenov Caspian State University (Есенов)", url: "https://yu.edu.kz/ru/3d-tur/" },
  { name: "Maqsut Narikbayev University (MNU/Narxoz)", url: "https://mir3d.kz/Narxoz_VR/" },
  { name: "QyzPU (Q-Uni)", url: "https://q-university.edu.kz/ru/about/virtual-tour" },
  { name: "Kazakh National Pedagogical University (Abai)", url: "https://mir3d.kz/2017/04/05/kaznpu-im-abaya/" },
];

const boolIcon = (v: any) =>
  v === true ? <Check className="inline-block align-middle" size={18} /> : <X className="inline-block align-middle" size={18} />;

const comparisonFields: { key: string; name: string; format: (v: any) => any }[] = [
  { key: "country_rank", name: "Нац. рейтинг", format: (v: number) => `#${v ?? "—"}` },
  { key: "ml_cs_strength", name: "Сила IT/ML", format: (v: number) => (v ?? "—") },
  { key: "city", name: "Город", format: (v: string) => v || "—" },
  { key: "has_dormitory", name: "Общежитие", format: (v: boolean) => boolIcon(v) },
  { key: "has_sports_facilities", name: "Спорт. комплекс", format: (v: boolean) => boolIcon(v) },
  { key: "has_exchange", name: "Обмен", format: (v: boolean) => boolIcon(v) },
  { key: "Partner Universities", name: "Партнёры по обмену", format: (v: string) => v || "—" },
  { key: "Financial Aid", name: "Фин. помощь", format: (v: string) => v || "—" },
];

type TabKey = "home" | "tour" | "comparison" | "catalog" | "pathfolio";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [isAuthed, setIsAuthed] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authErr, setAuthErr] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [unis, setUnis] = useState<University[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [aiResult, setAiResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [selectedUnis, setSelectedUnis] = useState<(University | null)[]>([null, null]);

  const [selectedTour, setSelectedTour] = useState<string | null>(STATIC_3D_TOURS[0]?.url || null);

  const [pf, setPf] = useState({
    headline: "LinkedIn for students — structured and clean",
    summary:
      "Pathfolio — динамичный интерактивный CV: сертификаты, проекты, волонтёрство и достижения в одном месте.",
    activities: [] as { title: string; org?: string; dates?: string; desc?: string }[],
    leadership: [] as { title: string; org?: string; dates?: string; desc?: string }[],
    awards: [] as { title: string; issuer?: string; date?: string; desc?: string }[],
    projects: [] as { title: string; link?: string; dates?: string; desc?: string }[],
    volunteering: [] as { title: string; org?: string; dates?: string; hours?: string; desc?: string }[],
    work: [] as { title: string; org?: string; dates?: string; desc?: string }[],
    certificates: [] as { title: string; issuer?: string; date?: string; link?: string }[],
  });

  const [pfAddOpen, setPfAddOpen] = useState(false);
  const [pfCategory, setPfCategory] = useState<
    "activities" | "leadership" | "awards" | "projects" | "volunteering" | "work" | "certificates"
  >("projects");
  const [pfDraft, setPfDraft] = useState<{ [k: string]: string }>({});


  const [modalUni, setModalUni] = useState<University | null>(null);
  const [uniDetails, setUniDetails] = useState<any>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  useEffect(() => {
    async function fetchUnis() {
      try {
        const res = await fetch("/api/universities");
        const data = await res.json();
        if (data?.error) setUnis([]);
        else setUnis(data);
      } catch {
        setUnis([]);
      } finally {
        setIsDataLoading(false);
      }
    }
    fetchUnis();
  }, []);

  
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/me");
        const d = await r.json();
        setIsAuthed(Boolean(d?.authed));
        setUserEmail(d?.user?.email || "");
      } catch {
        setIsAuthed(false);
        setUserEmail("");
      }
    })();
  }, []);
// Close mobile menu on tab change
  useEffect(() => {
    setMobileOpen(false);
  }, [activeTab]);

  const handleAiSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ query }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setAiResult(data);
    } catch {
      setAiResult({ error: "Ошибка соединения с AI. Проверьте API Key." });
    } finally {
      setLoading(false);
    }
  };

  const handleComparisonSelect = (uniName: string, index: number) => {
    const uni = unis.find((u) => u.name === uniName) || null;
    const next = [...selectedUnis];
    next[index] = uni;
    setSelectedUnis(next);
  };

  const openUniModal = async (uni: University) => {
    setModalUni(uni);
    setUniDetails(null);
    setIsDetailsLoading(true);
    try {
      const res = await fetch("/api/uni-details", {
        method: "POST",
        body: JSON.stringify({ uniName: uni.name }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setUniDetails(data);
    } catch {
      setUniDetails({ error: "Не удалось получить информацию от AI. Проверьте консоль." });
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const closeUniModal = () => {
    setModalUni(null);
    setUniDetails(null);
    setIsDetailsLoading(false);
  };

  const UniModal = () => {
    if (!modalUni) return null;

    const tabs = [
      { key: "Mission", name: "Миссия" },
      { key: "History", name: "История" },
      { key: "Leadership", name: "Лидерство" },
      { key: "Achievements", name: "Достижения" },
    ] as const;

    const [activeInfoTab, setActiveInfoTab] = useState<(typeof tabs)[number]["key"]>("Mission");

    useEffect(() => {
      setActiveInfoTab("Mission");
    }, [modalUni?.name]);

    const renderContent = (content: any) => {
      if (typeof content === "string" || typeof content === "number") {
        return <p className="whitespace-pre-line text-slate-700">{content}</p>;
      }
      if (content && typeof content === "object") {
        return (
          <div className="text-sm">
            <p className="mb-2 text-amber-700">⚠️ AI вернул объект вместо текста.</p>
            <pre className="bg-slate-50 border border-slate-200 rounded-xl p-3 overflow-x-auto">
              {JSON.stringify(content, null, 2)}
            </pre>
          </div>
        );
      }
      return <p className="text-slate-500">Информация не предоставлена.</p>;
    };

    const currentContent = uniDetails ? uniDetails[activeInfoTab] : null;

    return (
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={closeUniModal}
        role="dialog"
        aria-modal="true"
      >
        <div className="h-dvh w-full md:flex md:items-center md:justify-center md:p-6">
          <div
            className="bg-white h-dvh w-full md:h-auto md:max-w-3xl md:rounded-2xl md:shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 break-words">
                    {modalUni.name}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} /> {modalUni.city}
                    </span>
                    <a
                      href={modalUni.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {modalUni.website}
                    </a>
                  </p>
                </div>
                <button
                  onClick={closeUniModal}
                  className="shrink-0 p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                  aria-label="Close"
                >
                  <X />
                </button>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveInfoTab(t.key)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border ${
                      activeInfoTab === t.key
                        ? "border-blue-600 text-blue-600 bg-blue-50"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                    disabled={isDetailsLoading}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 md:p-6">
              {isDetailsLoading ? (
                <div className="flex items-center gap-2 text-slate-600">
                  <Cpu className="animate-spin" />
                  Загружаем детали…
                </div>
              ) : uniDetails?.error ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
                  Ошибка: {uniDetails.error}
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900">
                    {tabs.find((t) => t.key === activeInfoTab)?.name}
                  </h4>
                  {renderContent(currentContent)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const navItems = useMemo(
    () =>
      [
        { key: "home", label: "AI Репликатор", icon: <Search size={16} /> },
        { key: "tour", label: "3D Кампус", icon: <Globe size={16} /> },
        { key: "comparison", label: "Сравнение", icon: <Scale size={16} /> },
        { key: "catalog", label: "Каталог", icon: <Calculator size={16} /> },
        { key: "pathfolio", label: "Pathfolio", icon: <Globe size={16} /> },
      ] as const,
    []
  );

  return (
    <main className="min-h-dvh bg-slate-50">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center min-w-0">
            <div className="relative w-12 h-12 shrink-0">
              <Image src="/mentis.png" alt="Mentis" fill className="object-contain" />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((it) => (
              <button
                key={it.key}
                onClick={() => setActiveTab(it.key)}
                className={`hover:text-blue-600 ${
                  activeTab === it.key ? "text-blue-600" : "text-slate-700"
                }`}
              >
                {it.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthed ? (
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  setIsAuthed(false);
                  setUserEmail("");
                }}
                className="hidden md:inline-flex px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold hover:bg-slate-50 transition"
              >
                {userEmail ? `Выйти (${userEmail})` : "Выйти"}
              </button>
            ) : (
              <button
                onClick={() => { setAuthErr(null); setAuthMode("login"); setAuthOpen(true); }}
                className="hidden md:inline-flex px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Войти
              </button>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden px-4 pb-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3 space-y-1">
              {navItems.map((it) => (
                <button
                  key={it.key}
                  onClick={() => setActiveTab(it.key)}
                  className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-2 ${
                    activeTab === it.key ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"
                  }`}
                >
                  {it.icon} <span className="font-medium">{it.label}</span>
                </button>
              ))}
              {isAuthed ? (
                <button
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    setIsAuthed(false);
                    setUserEmail("");
                    setMobileOpen(false);
                  }}
                  className="w-full mt-2 px-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold hover:bg-slate-50 transition"
                >
                  {userEmail ? `Выйти (${userEmail})` : "Выйти"}
                </button>
              ) : (
                <button
                  onClick={() => { setAuthErr(null); setAuthMode("login"); setAuthOpen(true); }}
                  className="w-full mt-2 px-3 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                >
                  Войти
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* BODY */}
      {isDataLoading ? (
        <div className="max-w-7xl mx-auto px-6 py-16 text-center text-slate-600">
          Загрузка данных из CSV…
        </div>
      ) : (
        <>
          {/* 1) AI SECTION */}
          {activeTab === "home" && (
            <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14">
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
                  Mentis: ваш путь в университет 🎓
                </h1>
                <p className="mt-4 text-slate-600 text-base md:text-lg">
                  AI-репликатор использует базу из {unis.length} вузов для подбора.
                </p>
              </div>

              <div className="mt-8 max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-3 md:p-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-3">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Пример: хочу стать ML-инженером, нужен вуз в Алматы с общежитием и обменом в Корею…"
                    className="flex-1 p-4 outline-none text-slate-700 resize-none h-32 md:h-24 rounded-xl border border-slate-200 focus:border-blue-300"
                  />
                  <button
                    onClick={handleAiSearch}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 md:w-auto w-full"
                  >
                    {loading ? <Cpu className="animate-spin" /> : <Search size={20} />}
                    {loading ? "Анализ…" : "Подобрать"}
                  </button>
                </div>
              </div>

              {aiResult?.error && (
                <div className="mt-6 max-w-3xl mx-auto text-center p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
                  <p className="font-semibold">⚠️ Ошибка AI: {aiResult.error}</p>
                  <p className="mt-2 text-sm text-red-700/90">
                    Проверь, установлен ли <b>MISTRAL_API_KEY</b> на Vercel или в <code>.env.local</code>.
                  </p>
                </div>
              )}

              {aiResult?.recommendations && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {aiResult.recommendations.map((rec: any, idx: number) => {
                    const uni = unis.find((u) => u.name === rec.name);
                    if (!uni) return null;
                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 bg-green-100 text-green-700 px-3 py-1 rounded-bl-lg text-sm font-bold">
                          {rec.match_score}% Match
                        </div>

                        <div className="flex gap-4 mb-4">
                          <Globe size={40} className="text-blue-500 mt-1" />
                          <div className="min-w-0">
                            <h3 className="text-xl font-bold text-slate-900 leading-tight break-words">
                              {uni.name}
                            </h3>
                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin size={14} /> {uni.city}
                            </p>
                          </div>
                        </div>

                        <p className="text-slate-700 mb-4 bg-slate-50 p-3 rounded-xl text-sm">
                          <b>AI анализ:</b> {rec.reason}
                        </p>

                        <div className="flex gap-2 flex-wrap text-xs text-slate-600">
                          <span className="bg-slate-100 px-2 py-1 rounded-xl">
                            IT: {uni.ml_cs_strength}/5
                          </span>
                          <span className="bg-slate-100 px-2 py-1 rounded-xl">
                            Общежитие: {uni.has_dormitory ? "Есть" : "Нет"}
                          </span>
                          <span className="bg-slate-100 px-2 py-1 rounded-xl">
                            Обмен: {uni["Exchange Programs"] ? "Да" : "Нет"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </section>
          )}

          {/* 2) 3D TOUR */}
          {activeTab === "tour" && (
            <section className="h-[calc(100dvh-64px)] w-full bg-slate-100 relative">
              <div className="absolute top-0 w-full z-10 bg-white/95 backdrop-blur p-4 shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-0 md:px-2">
                  <h2 className="font-bold text-lg mb-2">
                    Виртуальный кампус ({STATIC_3D_TOURS.length} туров)
                  </h2>
                  <p className="text-sm text-slate-600 mb-3">
                    Выберите университет и откройте 3D-тур:
                  </p>
                  <select
                    onChange={(e) => setSelectedTour(e.target.value)}
                    value={selectedTour || ""}
                    className="w-full md:w-1/2 p-3 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="" disabled>
                      Выберите 3D тур…
                    </option>
                    {STATIC_3D_TOURS.map((t) => (
                      <option key={t.url} value={t.url}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedTour ? (
                <iframe
                  src={selectedTour}
                  width="100%"
                  height="100%"
                  style={{ border: 0, marginTop: "132px" }}
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-lg text-slate-500 pt-24 px-6 text-center">
                  Выберите университет из списка выше, чтобы начать 3D-тур.
                </div>
              )}
            </section>
          )}

          {/* 3) COMPARISON */}
          {activeTab === "comparison" && (
            <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
                <Scale size={30} className="text-blue-600" /> Сравнение университетов
              </h2>
              <p className="text-slate-600 mb-8">
                Выберите два университета, чтобы сравнить ключевые параметры.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <select
                  onChange={(e) => handleComparisonSelect(e.target.value, 0)}
                  className="p-3 border border-slate-300 rounded-xl bg-white text-base font-medium"
                  value={selectedUnis[0]?.name || ""}
                >
                  <option value="">Выберите ВУЗ 1 ({unis.length} в базе)…</option>
                  {unis.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.city})
                    </option>
                  ))}
                </select>

                <select
                  onChange={(e) => handleComparisonSelect(e.target.value, 1)}
                  className="p-3 border border-slate-300 rounded-xl bg-white text-base font-medium"
                  value={selectedUnis[1]?.name || ""}
                >
                  <option value="">Выберите ВУЗ 2 ({unis.length} в базе)…</option>
                  {unis.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.city})
                    </option>
                  ))}
                </select>
              </div>

              {(selectedUnis[0] || selectedUnis[1]) && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  {/* Mobile: table scroll */}
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[720px]">
                      <div className="grid grid-cols-3 bg-blue-50 font-bold text-slate-700 border-b border-blue-200 p-4">
                        <div>Параметр</div>
                        <div className="truncate">{selectedUnis[0]?.name || "ВУЗ 1"}</div>
                        <div className="truncate">{selectedUnis[1]?.name || "ВУЗ 2"}</div>
                      </div>

                      {comparisonFields.map((field) => (
                        <div
                          key={field.key}
                          className="grid grid-cols-3 border-b border-slate-100 p-4 hover:bg-slate-50 transition"
                        >
                          <div className="font-medium text-slate-700">{field.name}</div>
                          <div className="text-slate-600">
                            {selectedUnis[0] ? field.format((selectedUnis[0] as any)[field.key]) : "—"}
                          </div>
                          <div className="text-slate-600">
                            {selectedUnis[1] ? field.format((selectedUnis[1] as any)[field.key]) : "—"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* 4) CATALOG */}
          {activeTab === "catalog" && (
            <section className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Каталог вузов (все {unis.length} из CSV)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {unis.map((uni) => (
                  <div
                    key={uni.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition cursor-pointer"
                    onClick={() => openUniModal(uni)}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <h3 className="font-bold text-lg leading-tight break-words min-w-0">
                          {uni.name}
                        </h3>
                        <span className="shrink-0 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-xl">
                          Rank #{uni.country_rank}
                        </span>
                      </div>

                      <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                        <MapPin size={14} /> {uni.city}
                      </p>

                      <div className="space-y-2 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          <Cpu size={16} className="text-slate-400" />
                          <span>
                            IT Strength: <b>{uni.ml_cs_strength}/5</b>
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Globe size={16} className="text-slate-400 mt-0.5" />
                          <span className="break-words">
                            Обмен: {uni["Exchange Programs"] || uni.ExchangePrograms || "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <UniModal />
      <AuthModal
        open={authOpen}
        mode={authMode}
        setMode={setAuthMode}
        email={authEmail}
        setEmail={setAuthEmail}
        password={authPassword}
        setPassword={setAuthPassword}
        err={authErr}
        setErr={setAuthErr}
        loading={authLoading}
        setLoading={setAuthLoading}
        onClose={() => setAuthOpen(false)}
        onAuthed={(email) => { setIsAuthed(true); setUserEmail(email); }}
      />
    </main>
  );
}
