// app/dashboard/page.tsx
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    
        
        <main className="p-8 space-y-10 max-w-7xl mx-auto w-full">
          {/* Welcome Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-slate-900">Welcome Peterson,</h2>
              <p className="text-slate-500 italic">The only way to do great work is to love what you do!</p>
            </div>
            <Card className="bg-blue-50 border-none shadow-none px-6 py-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">User Point Balance</p>
              <div className="text-2xl font-bold text-blue-700">200 💎</div>
            </Card>
          </div>


          {/* Progress Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-blue-600 rounded-2xl text-white h-36 flex flex-col justify-between">
              <span className="font-bold">Quizathon</span>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black">10%</span>
                <span className="text-[10px] mb-1 opacity-80">You&quos;ve completed 2 opened quizzes</span>
              </div>
            </div>
            {/* ... other progress cards ... */}
          </section>
        </main>
     
  )
}