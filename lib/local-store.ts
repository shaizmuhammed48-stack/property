import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { MOCK_ENQUIRIES } from "./mock-data";
import type { Enquiry, EnquiryStatus } from "./types";

type StoreFile = {
  version: 1;
  seeded: boolean;
  enquiries: Enquiry[];
};

const STORE_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(STORE_DIR, "enquiries.json");

let memory: StoreFile | null = null;
let writeQueue: Promise<unknown> = Promise.resolve();

function seedStore(): StoreFile {
  return { version: 1, seeded: true, enquiries: [...MOCK_ENQUIRIES] };
}

async function readStore(): Promise<StoreFile> {
  if (memory) return memory;
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    if (!parsed || !Array.isArray(parsed.enquiries)) throw new Error("Invalid local store");
    memory = parsed;
    return parsed;
  } catch {
    memory = seedStore();
    return memory;
  }
}

async function persist(store: StoreFile): Promise<void> {
  memory = store;
  try {
    await fs.mkdir(STORE_DIR, { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch (error) {
    console.warn("[local-store] Could not persist enquiry store:", error);
  }
}

function queue<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export async function listLocalEnquiries(): Promise<Enquiry[]> {
  const store = await readStore();
  return [...store.enquiries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function appendLocalEnquiry(enquiry: Enquiry): Promise<Enquiry> {
  return queue(async () => {
    const store = await readStore();
    const next = {
      ...store,
      enquiries: [enquiry, ...store.enquiries],
    };
    await persist(next);
    return enquiry;
  });
}

export async function updateLocalEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<Enquiry | null> {
  return queue(async () => {
    const store = await readStore();
    let updated: Enquiry | null = null;
    const enquiries = store.enquiries.map((enquiry) => {
      if (enquiry.id !== id) return enquiry;
      updated = { ...enquiry, status };
      return updated;
    });
    if (updated) await persist({ ...store, enquiries });
    return updated;
  });
}

export async function findLocalDuplicate({
  phone,
  propertyId,
  windowMs = 10 * 60 * 1000,
}: {
  phone: string;
  propertyId?: string;
  windowMs?: number;
}): Promise<Enquiry | null> {
  const store = await readStore();
  const cutoff = Date.now() - windowMs;
  const normalized = phone.replace(/[^\d]/g, "").slice(-10);
  return (
    store.enquiries.find(
      (enquiry) =>
        enquiry.phone.replace(/[^\d]/g, "").endsWith(normalized) &&
        (enquiry.propertyId || "") === (propertyId || "") &&
        new Date(enquiry.createdAt).getTime() > cutoff
    ) || null
  );
}
