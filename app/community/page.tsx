'use client'

import { PageLayout } from "@/components/page-layout"
import { CommunitySection } from "./CommunitySection"

export default function CommunityPage() {
  return (
    <PageLayout>
      <div className="mb-12">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#2C2C2C] uppercase leading-[0.85] mb-6">
          Community
        </h1>
        <p className="text-xl md:text-2xl font-bold text-[#2C2C2C]/80 max-w-2xl">
          Engage, collaborate, and learn with your peers.
        </p>
      </div>
      <CommunitySection />
    </PageLayout>
  )
}
