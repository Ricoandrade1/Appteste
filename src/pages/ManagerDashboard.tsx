import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddProductModal } from "@/components/AddProductModal";
import { EditProductModal } from "@/components/EditProductModal"; // Import EditProductModal
import { AddBarberModal } from "@/components/AddBarberModal";
import { AddServiceModal } from "@/components/AddServiceModal"; // Import AddServiceModal
import { ReportPDF } from "@/components/ReportPDF";
import { pdf } from "@react-pdf/renderer";
import { toast } from "@/hooks/use-toast";
import { getProducts, getBarbers, getServices, getProductionResults, deleteProduct, deleteService } from "@/integrations/firebase/firebase-db";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ManagerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [productionResults, setProductionResults] = useState([]); // New state for production results
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const totalBalance = barbers.reduce((sum, barber) => sum + barber.balance, 0);

  const fetchData = async () => {
    console.log("fetchData called..."); // ADDED console.log
    setLoading(true);
    try {
      const productsData = await getProducts();
      setProducts(productsData);
      const servicesData = await getServices();
      setServices(servicesData);
      const productionResultsData = await getProductionResults(); // Fetch production results
      setProductionResults(productionResultsData); // Set production results state
      const barbersData = await getBarbers();
      setBarbers(barbersData);
      console.log("fetchData finished, products:", productsData); // ADDED console.log
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Houve um erro ao carregar os dados do Firebase.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchBarbers = async () => {
    try {
      const barbersData = await getBarbers();
      setBarbers(barbersData);
    } catch (error) {
      console.error("Error fetching barbers from Firebase:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar barbeiros",
        description: "Houve um erro ao carregar os barbeiros do Firebase.",
      });
    }
  };

  const handleAddProduct = (newProduct) => {
    const productToAdd = {
      id: products.length + 1,
      ...newProduct,
    };
    setProducts([...products, productToAdd]);
  };

  const handleAddBarber = () => {
    fetchBarbers();
  };

  const handleExportReport = async () => {
    try {
      const blob = await pdf(
        <ReportPDF products={products} barbers={barbers} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio-barbearia-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Relatório exportado",
        description: "O relatório foi gerado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao gerar o relatório.",
      });
    }
  };

  const onDeleteProduct = async (productId: string) => {
    console.log("onDeleteProduct called for productId:", productId); // ADDED console.log
    try {
      await deleteProduct(productId);
      console.log("deleteProduct finished for productId:", productId); // ADDED console.log
      toast({
        title: "Produto excluído",
        description: "Produto removido com sucesso.",
      });
      fetchData(); // Refresh product list
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir produto",
        description: "Houve um erro ao excluir o produto.",
      });
    }
  };

  const onDeleteService = async (serviceId: string) => {
    try {
      await deleteService(serviceId);
      toast({
        title: "Serviço excluído",
        description: "Serviço removido com sucesso.",
      });
      fetchData(); // Refresh service list
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir serviço",
        description: "Houve um erro ao excluir o serviço.",
      });
    }
  };


  if (loading) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Dashboard do Gerente</h1>
            <p className="text-muted-foreground">Gestão e Controle</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleExportReport}>
              Exportar Relatório
            </Button>
            <AddProductModal />
            <AddBarberModal onBarberAdded={handleAddBarber} />
            <AddServiceModal /> {/* Add AddServiceModal button */}
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium">Faturamento Hoje</h3>
            <p className="text-3xl font-bold mt-2">€850,00</p>
            <p className="text-sm text-muted-foreground mt-1">+15% vs. ontem</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium">Produtos em Estoque</h3>
            <p className="text-3xl font-bold mt-2">{products.reduce((sum, p) => sum + p.stock, 0)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {products.filter((p) => p.stock < 10).length} precisam reposição
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium">Barbeiros Ativos</h3>
            <p className="text-3xl font-bold mt-2">{barbers.length}</p>
            <p className="text-sm text-muted-foreground mt-1">2 em serviço agora</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium">Total a Pagar</h3>
            <p className="text-3xl font-bold mt-2">€{totalBalance.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">Comissões pendentes</p>
          </Card>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="barbers">Barbeiros</TabsTrigger>
            <TabsTrigger value="production">Produção</TabsTrigger> {/* New tab for Production */}
          </TabsList>

          <TabsContent value="products">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-right">{product.stock}</TableCell>
                      <TableCell className="text-right">€{product.price}</TableCell>
                      <TableCell className="text-right">
                        <EditProductModal product={product} onProductUpdated={fetchData} />
                        <Button variant="destructive" size="sm" className="ml-2" onClick={() => onDeleteProduct(product.id)}>
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell className="text-right">€{service.price}</TableCell>
                      <TableCell className="text-right">
                         <Button variant="destructive" size="sm" className="ml-2" onClick={() => onDeleteService(service.id)}>
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="barbers">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barbeiro</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {barbers.map((barber) => (
                    <TableRow key={barber.id}>
                      <TableCell>{barber.name}</TableCell>
                      <TableCell>{barber.email}</TableCell>
                      <TableCell>{barber.phone}</TableCell>
                      <TableCell>{barber.unit}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedBarber(barber)}>Detalhes</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Barbeiro</DialogTitle>
                              <DialogDescription>
                                Informações detalhadas sobre o barbeiro selecionado.
                              </DialogDescription>
                            </DialogHeader>
                            {selectedBarber && (
                              <div>
                                <p>Nome: {selectedBarber.name}</p>
                                <p>Email: {selectedBarber.email}</p>
                                <p>Telefone: {selectedBarber.phone}</p>
                                <p>Unidade: {selectedBarber.unit}</p>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="production"> {/* Production TabContent */}
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barbeiro</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead className="text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.barberName}</TableCell>
                      <TableCell>{result.serviceName}</TableCell>
                      <TableCell className="text-right">{result.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManagerDashboard;
