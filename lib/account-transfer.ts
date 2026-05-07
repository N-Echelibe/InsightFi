import { supabase } from "@/lib/supabase";

export type AccountTransferInput = {
  from_account_id: string;
  to_account_id: string;
  amount: number;
  description?: string;
  date: string;
};

export type AccountTransferResult = {
  from_account?: unknown;
  to_account?: unknown;
  from_transaction?: unknown;
  to_transaction?: unknown;
};

export async function createAccountTransfer(
  transfer: AccountTransferInput,
): Promise<AccountTransferResult | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("You need to sign in first.");
  }

  const { data, error } = await supabase.rpc("transfer_between_accounts", {
    p_user_id: user.id,
    p_from_account_id: transfer.from_account_id,
    p_to_account_id: transfer.to_account_id,
    p_amount: transfer.amount,
    p_description: transfer.description?.trim() || null,
    p_date: transfer.date,
    p_category_id: null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as AccountTransferResult | null;
}
