import { supabase } from "@/lib/supabase";
import type { DeptId } from "@/data/departments";

const codeFor = (dept: DeptId) => dept;

export async function createRegistration(input: { name: string; age: number; gender: string; mobile?: string; dept: DeptId }, idempotencyKey: string) {
  if (!supabase) throw new Error("database_unavailable");
  const { data: context, error: contextError } = await supabase.rpc("get_demo_registration_context");
  if (contextError) throw contextError;
  const row = (context as Array<{ hospital_id: string; department_id: string; department_code: string }>).find((item) => item.department_code === codeFor(input.dept));
  if (!row) throw new Error("department_unavailable");
  const { data, error } = await supabase.rpc("create_queue_registration", {
    p_display_name: input.name,
    p_age: input.age,
    p_gender: input.gender,
    p_mobile: input.mobile ?? null,
    p_hospital_id: row.hospital_id,
    p_department_id: row.department_id,
    p_visit_date: new Date().toISOString().slice(0, 10),
    p_idempotency_key: idempotencyKey,
  });
  if (error) throw error;
  const result = (data as Array<{ ticket_id: string; ticket_number: number; registration_reference: string; visit_id: string }> | null)?.[0];
  if (!result?.ticket_id || !Number.isInteger(result.ticket_number)) throw new Error("registration_empty");
  return result;
}
