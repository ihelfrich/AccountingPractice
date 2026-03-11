import type { Metadata } from "next";
import AccountingPracticeTool from "@/accounting/application";

export const metadata: Metadata = {
  title: "Accounting Practice Trainer",
  description: "Interactive Midterm 2 accounting practice for receivables, inventory, PP&E, liabilities, ratios, and TVM.",
};

export default function AccountingPage() {
  return <AccountingPracticeTool />;
}
