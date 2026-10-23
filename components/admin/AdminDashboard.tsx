"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownUp,
  CalendarDays,
  CheckCircle2,
  Copy,
  Download,
  Inbox,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";
import { ENQUIRY_STATUSES } from "@/lib/types";
import {
  cn,
  formatCompactPrice,
  formatDate,
  formatDateTime,
  initials,
} from "@/lib/format";
import { buildWhatsAppUrl, telHref } from "@/lib/whatsapp";
import type {
  ApiResponse,
  DataSource,
  Enquiry,
  EnquiryStatus,
} from "@/lib/types";

type PropertyOption = {
  id: string;
  name: string;
  city: string;
  price: number;
  propertyType: string;
};

type SortKey = "newest" | "oldest" | "name" | "status";

const STATUS_ORDER: Record<EnquiryStatus, number> = {
  New: 0,
  Contacted: 1,
  Interested: 2,
  Closed: 3,
};

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  New: "border-primary/15 bg-primary-fixed text-primary",
  Contacted: "border-outline-variant/60 bg-surface-container-high text-on-surface-variant",
  Interested: "border-champagne/50 bg-champagne/20 text-champagne-deep",
  Closed: "border-primary/10 bg-surface-container text-outline",
};

const STATUS_DOT: Record<EnquiryStatus, string> = {
  New: "bg-primary",
  Contacted: "bg-outline",
  Interested: "bg-champagne",
  Closed: "bg-outline-variant",
};

function propertyKey(enquiry: Enquiry) {
  return enquiry.propertyId || enquiry.propertyName || "General enquiry";
}

function day(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function csvCell(value: unknown) {
  const raw = String(value ?? "").replace(/\r?\n/g, " ").trim();
  const guarded = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${guarded.replace(/"/g, '""')}"`;
}

export function AdminDashboard({
  initialEnquiries,
  properties,
  source,
  warning,
}: {
  initialEnquiries: Enquiry[];
  properties: PropertyOption[];
  source: DataSource;
  warning?: string;
}) {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [status, setStatus] = useState<"All" | EnquiryStatus>("All");
  const [propertyFilter, setPropertyFilter] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(
    null
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(timer);
  }, [toast]);

  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const property of properties) map.set(property.id, property.price);
    return map;
  }, [properties]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const result = enquiries.filter((enquiry) => {
      if (status !== "All" && enquiry.status !== status) return false;
      if (propertyFilter !== "All" && propertyKey(enquiry) !== propertyFilter) return false;

      const created = day(enquiry.createdAt);
      if (from && created && created < from) return false;
      if (to && created && created > to) return false;

      if (q) {
        const haystack = [
          enquiry.id,
          enquiry.buyerName,
          enquiry.phone,
          enquiry.email,
          enquiry.propertyId,
          enquiry.propertyName,
          enquiry.preferredLocation,
          enquiry.budget,
          enquiry.propertyType,
          enquiry.bedrooms,
          enquiry.message,
          enquiry.status,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return result.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() ||
            a.id.localeCompare(b.id, undefined, { numeric: true })
          );
        case "name":
          return a.buyerName.localeCompare(b.buyerName);
        case "status":
          return (
            STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ||
            b.id.localeCompare(a.id, undefined, { numeric: true })
          );
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ||
            b.id.localeCompare(a.id, undefined, { numeric: true })
          );
      }
    });
  }, [enquiries, status, propertyFilter, from, to, deferredQuery, sort]);

  const stats = useMemo(() => {
    const counts: Record<EnquiryStatus, number> = {
      New: 0,
      Contacted: 0,
      Interested: 0,
      Closed: 0,
    };
    for (const enquiry of enquiries) counts[enquiry.status] += 1;
    const pipeline = enquiries.reduce(
      (sum, enquiry) => sum + (priceMap.get(enquiry.propertyId || "") || 0),
      0
    );
    return { counts, total: enquiries.length, pipeline };
  }, [enquiries, priceMap]);

  const propertyOptions = useMemo(() => {
    const map = new Map<string, { key: string; label: string; count: number }>();
    for (const property of properties) {
      map.set(property.id, {
        key: property.id,
        label: `${property.name} · ${property.city}`,
        count: 0,
      });
    }
    for (const enquiry of enquiries) {
      const key = propertyKey(enquiry);
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, {
          key,
          label: enquiry.propertyName || (enquiry.propertyId ? key : "General enquiry"),
          count: 1,
        });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => b.count - a.count || a.label.localeCompare(b.label)
    );
  }, [properties, enquiries]);

  const recent = useMemo(
    () =>
      [...enquiries]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [enquiries]
  );

  const activeFilters =
    Boolean(query) ||
    status !== "All" ||
    propertyFilter !== "All" ||
    Boolean(from) ||
    Boolean(to);

  function resetFilters() {
    setQuery("");
    setStatus("All");
    setPropertyFilter("All");
    setFrom("");
    setTo("");
    setSort("newest");
  }

  async function changeStatus(enquiry: Enquiry, next: EnquiryStatus) {
    if (next === enquiry.status || pendingId) return;
    setPendingId(enquiry.id);
    try {
      const response = await fetch(
        `/api/admin/enquiries/${encodeURIComponent(enquiry.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ status: next }),
        }
      );

      let payload: ApiResponse<{ enquiry: Enquiry }> | null = null;
      try {
        payload = (await response.json()) as ApiResponse<{ enquiry: Enquiry }>;
      } catch {
        payload = null;
      }

      if (response.status === 401) {
        router.replace("/admin/login");
        router.refresh();
        return;
      }

      if (!response.ok || !payload || !payload.ok) {
        setToast({
          message:
            payload && !payload.ok
              ? payload.error.message
              : "The status could not be updated. Please retry.",
          tone: "error",
        });
        return;
      }

      setEnquiries((current) =>
        current.map((item) =>
          item.id === enquiry.id ? { ...item, status: next } : item
        )
      );
      setToast({
        message: `${enquiry.buyerName} marked as ${next}.`,
        tone: "success",
      });
    } catch {
      setToast({
        message: "The connection was interrupted. The status was not changed.",
        tone: "error",
      });
    } finally {
      setPendingId(null);
    }
  }

  async function copyPhone(phone: string) {
    try {
      await navigator.clipboard.writeText(phone);
      setToast({ message: "Phone number copied to clipboard.", tone: "success" });
    } catch {
      setToast({ message: "Could not access the clipboard.", tone: "error" });
    }
  }

  function exportCsv() {
    if (filtered.length === 0) {
      setToast({ message: "There are no enquiries in this view to export.", tone: "error" });
      return;
    }
    const headers = [
      "Enquiry ID",
      "Buyer name",
      "Phone",
      "Email",
      "Property ID",
      "Property name",
      "Preferred location",
      "Budget",
      "Property type",
      "Bedrooms",
      "Message",
      "Status",
      "Received",
      "Source",
    ];
    const rows = filtered.map((enquiry) => [
      enquiry.id,
      enquiry.buyerName,
      enquiry.phone,
      enquiry.email,
      enquiry.propertyId,
      enquiry.propertyName || "",
      enquiry.preferredLocation,
      enquiry.budget,
      enquiry.propertyType,
      enquiry.bedrooms,
      enquiry.message,
      enquiry.status,
      enquiry.createdAt,
      enquiry.source,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `kerala-estates-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setToast({
      message: `Exported ${filtered.length} ${filtered.length === 1 ? "enquiry" : "enquiries"}.`,
      tone: "success",
    });
  }

  return (
    <div className="shell py-6 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-champagne-deep">
            <span className="h-1.5 w-1.5 rounded-full bg-champagne" aria-hidden="true" />
            Private concierge · Central desk CRM
          </div>
          <h1 className="mt-2 font-serif text-[2.1rem] leading-[1.05] tracking-[-0.025em] text-primary sm:text-[2.6rem]">
            Buyer enquiries &amp; advisor desk
          </h1>
          <p className="mt-1.5 font-sans text-[13px] leading-6 text-on-surface-variant">
            Live investor enquiries across Kerala waterfront and urban portfolios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-9 items-center gap-1.5 rounded-lg border border-primary/[0.07] bg-surface-container-lowest px-3 font-sans text-[10px] font-semibold text-on-surface-variant">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                source === "apps-script" ? "bg-primary" : "bg-champagne"
              )}
              aria-hidden="true"
            />
            {source === "apps-script" ? "Live sheet bridge" : "Local preview store"}
          </span>
          <button
            type="button"
            onClick={exportCsv}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-surface-container-high px-3.5 font-sans text-[11px] font-semibold text-primary transition-colors hover:bg-surface-container-highest"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>

      {warning ? (
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-champagne/30 bg-champagne/10 px-4 py-3 font-sans text-[11px] leading-5 text-champagne-deep">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{warning}</span>
        </div>
      ) : null}

      {/* KPIs */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total enquiries",
            value: stats.total,
            note: stats.pipeline
              ? `${formatCompactPrice(stats.pipeline)} matched portfolio`
              : "All buyer conversations",
            icon: Inbox,
            accent: false,
          },
          {
            label: "New",
            value: stats.counts.New,
            note: stats.counts.New > 0 ? "Awaiting first callback" : "Inbox clear",
            icon: ShieldCheck,
            accent: stats.counts.New > 0,
          },
          {
            label: "In progress",
            value: stats.counts.Contacted + stats.counts.Interested,
            note: `${stats.counts.Contacted} contacted · ${stats.counts.Interested} interested`,
            icon: CalendarDays,
            accent: false,
          },
          {
            label: "Closed",
            value: stats.counts.Closed,
            note: "Completed this season",
            icon: CheckCircle2,
            accent: false,
          },
        ].map((card) => (
          <div
            key={card.label}
            className={cn(
              "relative overflow-hidden rounded-xl border p-4 shadow-ambient sm:p-5",
              card.accent
                ? "border-champagne/35 bg-gradient-to-br from-champagne/15 to-surface-container-lowest"
                : "border-primary/[0.07] bg-surface-container-lowest"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-outline">
                {card.label}
              </span>
              <card.icon className="h-4 w-4 text-champagne-deep" aria-hidden="true" />
            </div>
            <p className="mt-2 font-serif text-[2rem] leading-none text-primary">
              {String(card.value).padStart(2, "0")}
            </p>
            <p className="mt-2 font-sans text-[10px] leading-4 text-on-surface-variant">
              {card.note}
            </p>
          </div>
        ))}
      </div>

      {/* Workstation */}
      <div className="mt-6 grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-9">
          <div className="rounded-xl border border-primary/[0.07] bg-surface-container-lowest shadow-ambient">
            <div className="border-b border-primary/[0.07] p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <label className="relative w-full lg:max-w-sm">
                  <span className="sr-only">Search enquiries</span>
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
                    aria-hidden="true"
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="input-field h-10 pl-10 pr-9 text-[13px]"
                    placeholder="Search buyer, phone, ref, property…"
                    type="search"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-outline transition-colors hover:bg-surface-container hover:text-primary"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ) : null}
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="relative">
                    <span className="sr-only">Sort enquiries</span>
                    <ArrowDownUp
                      className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-outline"
                      aria-hidden="true"
                    />
                    <select
                      value={sort}
                      onChange={(event) => setSort(event.target.value as SortKey)}
                      className="select-field h-10 pl-9 pr-8 text-[12px] lg:w-44"
                    >
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="name">Buyer name</option>
                      <option value="status">Status</option>
                    </select>
                  </label>
                  {activeFilters ? (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="flex h-10 items-center gap-1.5 rounded-lg px-2.5 font-sans text-[11px] font-semibold text-champagne-deep transition-colors hover:text-primary"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      Reset
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex gap-1 overflow-x-auto pb-0.5 no-scrollbar">
                {(["All", ...ENQUIRY_STATUSES] as const).map((tab) => {
                  const count =
                    tab === "All"
                      ? enquiries.length
                      : enquiries.filter((enquiry) => enquiry.status === tab).length;
                  const active = status === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setStatus(tab)}
                      aria-pressed={active}
                      className={cn(
                        "shrink-0 rounded-lg px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.08em] transition-colors",
                        active
                          ? "bg-primary text-white shadow-sm"
                          : "text-outline hover:bg-surface-container hover:text-primary"
                      )}
                    >
                      {tab} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <label>
                  <span className="form-label">Property</span>
                  <select
                    value={propertyFilter}
                    onChange={(event) => setPropertyFilter(event.target.value)}
                    className="select-field h-10 text-[12px]"
                  >
                    <option value="All">All properties</option>
                    {propertyOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label} ({option.count})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="form-label">From</span>
                  <input
                    type="date"
                    value={from}
                    onChange={(event) => setFrom(event.target.value)}
                    className="input-field h-10 text-[12px]"
                    max={to || undefined}
                  />
                </label>
                <label>
                  <span className="form-label">To</span>
                  <input
                    type="date"
                    value={to}
                    onChange={(event) => setTo(event.target.value)}
                    className="input-field h-10 text-[12px]"
                    min={from || undefined}
                  />
                </label>
                <div className="flex items-end">
                  <p className="pb-2.5 font-sans text-[10px] leading-4 text-outline">
                    Showing <span className="font-bold text-primary">{filtered.length}</span> of{" "}
                    {enquiries.length} enquiries
                  </p>
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-champagne/10 text-champagne-deep">
                  <Inbox className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-serif text-[22px] text-primary">
                  No enquiries in this view
                </h2>
                <p className="mt-1.5 max-w-sm font-sans text-[12px] leading-6 text-on-surface-variant">
                  Try a different status, property or date range. New website enquiries appear here
                  as soon as they are submitted.
                </p>
                {activeFilters ? (
                  <button type="button" onClick={resetFilters} className="btn-outline mt-5 h-10 text-[12px]">
                    Clear all filters
                  </button>
                ) : null}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[980px] text-left">
                    <thead>
                      <tr className="bg-surface-container-low font-sans text-[9px] font-bold uppercase tracking-[0.12em] text-outline">
                        <th className="px-4 py-3">Buyer &amp; contact</th>
                        <th className="px-3 py-3">Property</th>
                        <th className="px-3 py-3">Location &amp; budget</th>
                        <th className="px-3 py-3">Requirement</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Received</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/[0.06]">
                      {filtered.map((enquiry) => (
                        <tr key={enquiry.id} className="group transition-colors hover:bg-surface-container-low/60">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed font-sans text-[10px] font-bold text-primary">
                                {initials(enquiry.buyerName)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-sans text-[13px] font-bold text-primary">
                                  {enquiry.buyerName}
                                </p>
                                <p className="mt-0.5 flex items-center gap-1 font-sans text-[10px] text-on-surface-variant">
                                  <span>{enquiry.phone || "No phone"}</span>
                                  {enquiry.phone ? (
                                    <button
                                      type="button"
                                      onClick={() => copyPhone(enquiry.phone)}
                                      className="text-outline transition-colors hover:text-primary"
                                      aria-label={`Copy ${enquiry.buyerName}'s phone number`}
                                    >
                                      <Copy className="h-3 w-3" aria-hidden="true" />
                                    </button>
                                  ) : null}
                                </p>
                                {enquiry.email ? (
                                  <p className="mt-0.5 truncate font-sans text-[9px] text-outline">
                                    {enquiry.email}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3.5">
                            {enquiry.propertyId ? (
                              <span className="font-sans text-[9px] font-bold uppercase tracking-[0.1em] text-champagne-deep">
                                {enquiry.propertyId}
                              </span>
                            ) : null}
                            <p className="max-w-[150px] truncate font-sans text-[11px] font-semibold text-on-surface">
                              {enquiry.propertyName || (enquiry.propertyId ? "Indexed residence" : "General brief")}
                            </p>
                          </td>
                          <td className="px-3 py-3.5">
                            <p className="font-sans text-[11px] font-bold text-primary">
                              {enquiry.budget || "Budget on request"}
                            </p>
                            {enquiry.preferredLocation ? (
                              <p className="mt-0.5 flex items-center gap-0.5 font-sans text-[9px] text-outline">
                                <MapPin className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                                <span className="max-w-[150px] truncate">{enquiry.preferredLocation}</span>
                              </p>
                            ) : null}
                          </td>
                          <td className="px-3 py-3.5">
                            <p className="max-w-[200px] truncate font-sans text-[11px] italic text-on-surface-variant">
                              {enquiry.message ? `“${enquiry.message}”` : "—"}
                            </p>
                            <p className="mt-0.5 max-w-[200px] truncate font-sans text-[9px] text-outline">
                              {[enquiry.propertyType, enquiry.bedrooms ? `${enquiry.bedrooms} BHK` : ""]
                                .filter(Boolean)
                                .join(" · ") || "No configuration given"}
                            </p>
                          </td>
                          <td className="px-3 py-3.5">
                            <StatusControl
                              enquiry={enquiry}
                              pending={pendingId === enquiry.id}
                              onChange={changeStatus}
                            />
                          </td>
                          <td className="px-3 py-3.5">
                            <p className="font-sans text-[10px] font-semibold text-on-surface">
                              {formatDate(enquiry.createdAt)}
                            </p>
                            <p className="mt-0.5 font-sans text-[9px] uppercase tracking-[0.08em] text-outline">
                              {enquiry.source}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-end gap-1">
                              <a
                                href={telHref(enquiry.phone)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary transition-colors hover:bg-primary hover:text-white"
                                aria-label={`Call ${enquiry.buyerName}`}
                              >
                                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                              </a>
                              <a
                                href={buildWhatsAppUrl({
                                  phone: enquiry.phone,
                                  message: enquiryWhatsApp(enquiry),
                                })}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-champagne-deep transition-colors hover:bg-champagne hover:text-primary"
                                aria-label={`WhatsApp ${enquiry.buyerName}`}
                              >
                                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="divide-y divide-primary/[0.06] lg:hidden">
                  {filtered.map((enquiry) => (
                    <article key={enquiry.id} className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-fixed font-sans text-[10px] font-bold text-primary">
                            {initials(enquiry.buyerName)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-sans text-[14px] font-bold text-primary">
                              {enquiry.buyerName}
                            </p>
                            <p className="truncate font-sans text-[10px] text-on-surface-variant">
                              {enquiry.phone || "No phone"}
                              {enquiry.email ? ` · ${enquiry.email}` : ""}
                            </p>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-sans text-[8px] font-bold uppercase tracking-[0.08em]",
                            STATUS_STYLES[enquiry.status]
                          )}
                        >
                          <span className={cn("h-1 w-1 rounded-full", STATUS_DOT[enquiry.status])} />
                          {enquiry.status}
                        </span>
                      </div>

                      <dl className="mt-3 grid gap-2 rounded-lg bg-surface-container-low p-3 text-[11px]">
                        <div className="flex items-start justify-between gap-3">
                          <dt className="font-sans text-[9px] font-bold uppercase tracking-[0.1em] text-outline">
                            Property
                          </dt>
                          <dd className="max-w-[65%] text-right font-sans font-semibold text-primary">
                            {enquiry.propertyName || enquiry.propertyId || "General enquiry"}
                          </dd>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <dt className="font-sans text-[9px] font-bold uppercase tracking-[0.1em] text-outline">
                            Budget
                          </dt>
                          <dd className="text-right font-sans font-semibold text-primary">
                            {enquiry.budget || "On request"}
                          </dd>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <dt className="font-sans text-[9px] font-bold uppercase tracking-[0.1em] text-outline">
                            Location
                          </dt>
                          <dd className="max-w-[65%] text-right font-sans text-on-surface-variant">
                            {enquiry.preferredLocation || "Kerala"}
                          </dd>
                        </div>
                      </dl>

                      {enquiry.message ? (
                        <p className="mt-2.5 font-sans text-[11px] italic leading-5 text-on-surface-variant">
                          “{enquiry.message}”
                        </p>
                      ) : null}

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="font-sans text-[9px] text-outline">
                          {formatDateTime(enquiry.createdAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          <a
                            href={telHref(enquiry.phone)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container text-primary"
                            aria-label={`Call ${enquiry.buyerName}`}
                          >
                            <Phone className="h-4 w-4" aria-hidden="true" />
                          </a>
                          <a
                            href={buildWhatsAppUrl({
                              phone: enquiry.phone,
                              message: enquiryWhatsApp(enquiry),
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-champagne/20 text-champagne-deep"
                            aria-label={`WhatsApp ${enquiry.buyerName}`}
                          >
                            <MessageCircle className="h-4 w-4" aria-hidden="true" />
                          </a>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="form-label">Update stage</label>
                        <StatusSelect
                          enquiry={enquiry}
                          pending={pendingId === enquiry.id}
                          onChange={changeStatus}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            <div className="flex flex-col gap-2 border-t border-primary/[0.07] px-4 py-3 font-sans text-[9px] text-outline sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <span>
                {filtered.length} {filtered.length === 1 ? "record" : "records"} in view · CSV
                export respects the active filters
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-champagne-deep" aria-hidden="true" />
                Confidential buyer information
              </span>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <aside className="space-y-4 xl:col-span-3">
          <div className="rounded-xl border border-primary/[0.07] bg-surface-container-lowest p-4 shadow-ambient">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-serif text-[19px] text-primary">Property interest</h2>
              <span className="font-sans text-[9px] font-bold uppercase tracking-[0.12em] text-outline">
                Filter
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <button
                type="button"
                onClick={() => setPropertyFilter("All")}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left font-sans text-[11px] transition-colors",
                  propertyFilter === "All"
                    ? "bg-surface-container font-bold text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                )}
              >
                <span>All properties</span>
                <span className="rounded bg-surface-container-high px-1.5 py-0.5 text-[9px] text-outline">
                  {enquiries.length}
                </span>
              </button>
              {propertyOptions.slice(0, 7).map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setPropertyFilter(option.key)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left font-sans text-[11px] transition-colors",
                    propertyFilter === option.key
                      ? "bg-surface-container font-bold text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-low"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  <span className="shrink-0 rounded bg-surface-container-high px-1.5 py-0.5 text-[9px] text-outline">
                    {option.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-primary/[0.07] bg-surface-container-lowest p-4 shadow-ambient">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-serif text-[19px] text-primary">Recent activity</h2>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-champagne" aria-hidden="true" />
            </div>
            <ol className="mt-4 space-y-3.5 border-l border-primary/10 pl-4">
              {recent.map((enquiry) => (
                <li key={enquiry.id} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-surface-container-lowest",
                      STATUS_DOT[enquiry.status]
                    )}
                    aria-hidden="true"
                  />
                  <p className="font-sans text-[11px] font-bold text-primary">
                    {enquiry.buyerName}
                  </p>
                  <p className="mt-0.5 font-sans text-[10px] leading-4 text-on-surface-variant">
                    {enquiry.propertyName || "General brief"} · {enquiry.status}
                  </p>
                  <p className="mt-0.5 font-sans text-[9px] text-outline">
                    {formatDate(enquiry.createdAt)} · {enquiry.source}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-champagne/25 bg-champagne/10 p-4">
            <p className="font-sans text-[9px] font-bold uppercase tracking-[0.16em] text-champagne-deep">
              Desk note
            </p>
            <p className="mt-1.5 font-sans text-[11px] leading-5 text-on-surface-variant">
              Only the {status === "All" ? "current" : status.toLowerCase()} view is displayed.
              Status changes save instantly and are written back to the enquiry sheet when the
              Apps Script bridge is connected.
            </p>
          </div>
        </aside>
      </div>

      {/* Toast */}
      <div
        className={cn(
          "fixed bottom-5 right-4 z-50 flex max-w-sm items-start gap-2.5 rounded-xl px-4 py-3 font-sans text-[12px] shadow-modal transition-all duration-300 sm:right-6",
          toast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
          toast?.tone === "error"
            ? "bg-error text-white"
            : "bg-primary text-on-primary"
        )}
        role="status"
        aria-live="polite"
      >
        {toast?.tone === "error" ? (
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary-fixed" aria-hidden="true" />
        )}
        <span>{toast?.message || ""}</span>
      </div>
    </div>
  );
}

function enquiryWhatsApp(enquiry: Enquiry) {
  return `Namaskaram ${enquiry.buyerName}, this is the Kerala Estates private desk${
    enquiry.propertyName ? ` regarding ${enquiry.propertyName}` : ""
  }${enquiry.propertyId ? ` (Ref: ${enquiry.propertyId})` : ""}. Thank you for your enquiry ${
    enquiry.id
  }. When would be a good time to speak?`;
}

function StatusSelect({
  enquiry,
  pending,
  onChange,
}: {
  enquiry: Enquiry;
  pending: boolean;
  onChange: (enquiry: Enquiry, status: EnquiryStatus) => void;
}) {
  return (
    <div className="relative">
      <select
        value={enquiry.status}
        onChange={(event) => onChange(enquiry, event.target.value as EnquiryStatus)}
        disabled={pending}
        aria-label={`Update status for ${enquiry.buyerName}`}
        className={cn(
          "h-8 w-full cursor-pointer appearance-none rounded-full border pl-3 pr-7 font-sans text-[9px] font-bold uppercase tracking-[0.08em] focus:outline-none focus:ring-2 focus:ring-champagne/40 disabled:opacity-60",
          STATUS_STYLES[enquiry.status]
        )}
      >
        {ENQUIRY_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      {pending ? (
        <Loader2
          className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin"
          aria-hidden="true"
        />
      ) : (
        <span
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-current"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function StatusControl({
  enquiry,
  pending,
  onChange,
}: {
  enquiry: Enquiry;
  pending: boolean;
  onChange: (enquiry: Enquiry, status: EnquiryStatus) => void;
}) {
  return (
    <div className="w-[112px]">
      <StatusSelect enquiry={enquiry} pending={pending} onChange={onChange} />
    </div>
  );
}
