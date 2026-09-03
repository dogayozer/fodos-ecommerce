import React, { Suspense } from 'react'
import { SidebarNav } from './SidebarNav'

export function Sidebar({ tree }: { tree: any[] }) {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-neutral-200 bg-neutral-0 min-h-screen hidden md:block overflow-y-auto sticky top-16" style={{ height: 'calc(100vh - 4rem)' }}>
      <Suspense fallback={<div className="p-4 text-center text-sm text-neutral-500">Yükleniyor...</div>}>
        <SidebarNav tree={tree} />
      </Suspense>
    </aside>
  )
}
