"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { useParams } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  status: string;
  completedAt: Date;
}

interface PomodoroSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  type: 'WORK' | 'BREAK';
}

interface ChartData {
  date: string;
  tasks: number;
  workMinutes: number;
  breakMinutes: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function StatsPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [timeRange, setTimeRange] = useState('7');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<{ name: string; value: number }[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalWorkMinutes, setTotalWorkMinutes] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tasks
        const tasksRes = await fetch(`/api/projects/${projectId}/tasks?days=${timeRange}`);
        const tasksData = await tasksRes.json();

        // Fetch pomodoro sessions
        const pomodoroRes = await fetch(`/api/pomodoro/sessions?days=${timeRange}`);
        const pomodoroData = await pomodoroRes.json();

        // Process data for charts
        const days = Array.from({ length: parseInt(timeRange) }, (_, i) => {
          const date = subDays(new Date(), i);
          return format(date, 'yyyy-MM-dd');
        }).reverse();

        let totalTaskCount = 0;
        let totalWorkMins = 0;

        const newChartData = days.map(date => {
          const dayStart = startOfDay(new Date(date));
          const dayEnd = endOfDay(new Date(date));

          const dayTasks = tasksData.filter((task: Task) => {
            const completedAt = new Date(task.completedAt);
            return completedAt >= dayStart && completedAt <= dayEnd;
          }).length;

          totalTaskCount += dayTasks;

          const daySessions = pomodoroData.filter((session: PomodoroSession) => {
            const sessionStart = new Date(session.startTime);
            return sessionStart >= dayStart && sessionStart <= dayEnd;
          });

          const workMinutes = daySessions
            .filter((session: PomodoroSession) => session.type === 'WORK')
            .reduce((acc: number, session: PomodoroSession) => acc + session.duration / 60, 0);

          const breakMinutes = daySessions
            .filter((session: PomodoroSession) => session.type === 'BREAK')
            .reduce((acc: number, session: PomodoroSession) => acc + session.duration / 60, 0);

          totalWorkMins += workMinutes;

          return {
            date: format(new Date(date), 'MMM dd'),
            tasks: dayTasks,
            workMinutes,
            breakMinutes,
          };
        });

        setTotalTasks(totalTaskCount);
        setTotalWorkMinutes(totalWorkMins);
        setChartData(newChartData);

        // Calculate status distribution
        const statusCount = tasksData.reduce((acc: { [key: string]: number }, task: Task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        }, {});

        const distribution = Object.entries(statusCount).map(([name, value]) => ({
          name,
          value: value as number,
        }));

        setStatusDistribution(distribution);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      }
    };

    fetchData();
  }, [timeRange, projectId]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Project Statistics</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTasks}</div>
            <p className="text-sm text-muted-foreground">in the last {timeRange} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Work Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(totalWorkMinutes)} minutes</div>
            <p className="text-sm text-muted-foreground">in the last {timeRange} days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" fill="#8884d8" name="Tasks Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pomodoro Sessions</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="workMinutes" fill="#82ca9d" name="Work Minutes" />
                <Bar dataKey="breakMinutes" fill="#ffc658" name="Break Minutes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
