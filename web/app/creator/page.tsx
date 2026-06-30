import { Suspense } from "react";
import { Creator } from "@/components/creator/Creator";

export default function CreatorPage() {
  return (
    <Suspense fallback={<div className="p-6 text-app-muted">در حال بارگذاری...</div>}>
      <Creator />
    </Suspense>
  );
}
