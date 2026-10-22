import type { DeptId } from "./departments";

// Synthetic, fictional names only.
export const SEED_PATIENTS: { name: string; dept: DeptId }[] = [
  ["Ravi", "MED"], ["Sunita", "MED"], ["Mohan", "MED"], ["Kamala", "MED"], ["Imran", "MED"], ["Geeta", "MED"],
  ["Arun", "CHD"], ["Priya", "CHD"], ["Nila", "CHD"], ["Kabir", "CHD"],
  ["Lakshmi", "WOM"], ["Fatima", "WOM"], ["Rekha", "WOM"], ["Divya", "WOM"],
  ["Ramesh", "ORT"], ["Selvi", "ORT"], ["Harish", "ORT"], ["Joseph", "ORT"],
  ["Anand", "ENT"], ["Meena", "ENT"], ["Bala", "ENT"],
  ["Shanti", "EYE"], ["Gopal", "EYE"], ["Usha", "EYE"],
  ["Karthik", "SKN"], ["Pooja", "SKN"], ["Venkat", "SKN"],
].map(([name, dept]) => ({ name, dept: dept as DeptId }));

export const SAMPLE_20: { name: string; dept: DeptId }[] = [
  ["Asha", "MED"], ["Babu", "MED"], ["Chitra", "MED"], ["Deepak", "MED"],
  ["Esther", "CHD"], ["Farhan", "CHD"], ["Gauri", "WOM"], ["Hema", "WOM"],
  ["Irfan", "ORT"], ["Jaya", "ORT"], ["Kumar", "ORT"], ["Latha", "ENT"],
  ["Manoj", "ENT"], ["Nandini", "EYE"], ["Om", "EYE"], ["Parvati", "EYE"],
  ["Qasim", "SKN"], ["Radha", "SKN"], ["Sanjay", "MED"], ["Tara", "CHD"],
].map(([name, dept]) => ({ name, dept: dept as DeptId }));
