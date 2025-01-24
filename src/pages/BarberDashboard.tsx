import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getBarberByEmail } from '@/integrations/firebase/firebase-db';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ServiceEntry } from "@/components/ServiceEntry";

const mockData = [
  { name: "Seg", value: 400 },
  { name: "Ter", value: 300 },
  { name: "Qua", value: 600 },
  { name: "Qui", value: 400 },
  { name: "Sex", value: 500 },
  { name: "Sab", value: 800 },
  { name: "Dom", value: 100 },
];

const mockServices = [
  { id: 1, service: "Corte Masculino", value: 35, commission: 14 },
  { id: 2, service: "Barba", value: 25, commission: 10 },
  { id: 3, service: "Corte + Barba", value: 55, commission: 22 },
];

const BarberDashboard = () => {
  const [barberData, setBarberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchBarberData = async () => {
      if (user && user.email) {
        const data = await getBarberByEmail(user.email);
        setBarberData(data);
      }
      setLoading(false);
    };

    fetchBarberData();
  }, [user]);

  if (loading) {
    return <div>Loading barber data...</div>;
  }

  if (!barberData) {
    return <div>
      <h1>Barber Dashboard</h1>
      <p>New Barber - No data found for your email.</p>
      {/* ... display "new barber" UI ... */}
    </div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Dashboard do Barbeiro</h1>
            <p className="text-muted-foreground">Bem-vindo de volta, {barberData.name || 'Barbeiro'}</p>
          </div>
          <Button variant="outline">Atualizar Dados</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ServiceEntry
              onServiceComplete={(service) => {
                console.log("Service completed:", service)
                // Here we'll update the UI with the new service
              }}
            />
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium">Ganhos Hoje</h3>
                <p className="text-3xl font-bold mt-2">€46,00</p>
                <p className="text-sm text-muted-foreground mt-1">Comissão: €18,40</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-medium">Ganhos esta Semana</h3>
                <p className="text-3xl font-bold mt-2">€385,00</p>
                <p className="text-sm text-muted-foreground mt-1">Comissão: €154,00</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-medium">Serviços Hoje</h3>
                <p className="text-3xl font-bold mt-2">5</p>
                <p className="text-sm text-muted-foreground mt-1">+2 agendados</p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Desempenho Semanal</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1a2b4b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Últimos Serviços</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Serviço</th>
                      <th className="text-right py-3 px-4">Valor</th>
                      <th className="text-right py-3 px-4">Comissão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockServices.map((service) => (
                      <tr key={service.id} className="border-b">
                        <td className="py-3 px-4">{service.service}</td>
                        <td className="text-right py-3 px-4">€{service.value}</td>
                        <td className="text-right py-3 px-4">€{service.commission}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberDashboard;
