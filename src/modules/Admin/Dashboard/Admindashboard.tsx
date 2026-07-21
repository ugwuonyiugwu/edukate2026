'use client';
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Library, BrainCircuit, ShieldCheck, UserCog, Trophy } from "lucide-react";
import { LoadingSpinner } from "@/modules/home/ui/components/Logospinal";

export const AdminDashboardView = () => {
  const { data: stats, isLoading } = trpc.admin.getDashboardStats.useQuery();

  if (isLoading) return <LoadingSpinner/>;

  return (
    <div className="mt-8 px-4 md:px-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Points Card */}
        <Card className="bg-blue-950 text-white border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Total System Points</CardTitle><Trophy size={16} /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.totalPoints}</div></CardContent>
        </Card>

        <Card className="bg-blue-600 text-white border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Total Users</CardTitle><Users size={16} /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.totalUsers}</div></CardContent>
        </Card>
        
        <Card className="bg-[#00C7B1] text-white border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Total Admins</CardTitle><ShieldCheck size={16} /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.totalAdmins}</div></CardContent>
        </Card>

        <Card className="bg-[#F59E0B] text-white border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Total Facilitators</CardTitle><UserCog size={16} /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.totalFacilitators}</div></CardContent>
        </Card>

        <Card className="bg-blue-950 text-white border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Total Documents</CardTitle><FileText size={16} /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.totalDocuments}</div></CardContent>
        </Card>

        <Card className="bg-blue-600 text-white border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Total Libraries</CardTitle><Library size={16} /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.totalLibraries}</div></CardContent>
        </Card>

        <Card className="bg-[#00C7B1] text-white border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Total Quizzes</CardTitle><BrainCircuit size={16} /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.totalQuizzes}</div></CardContent>
        </Card>
      </div>
    </div>
  );
};